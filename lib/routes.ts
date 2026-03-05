import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildTree } from './tree';
import { parsePorcelain } from './utils';
import git from './git';
import serveStatic from './static';
import logger from './logger';
import type FileDiffServer from './server';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface RouteConfig {
  gitDir: string;
  workTree: string;
  gitSubDir?: string;
}

interface AugmentedRequest extends IncomingMessage {
  parsedUrl: URL;
  params: string[];
  query: URLSearchParams;
}

interface AugmentedResponse extends ServerResponse {
  json: (data: unknown, statusCode?: number) => void;
  html: (content: string, statusCode?: number) => void;
  text: (content: string, statusCode?: number) => void;
}

export default function registerRoutes(app: FileDiffServer, config: RouteConfig): void {
  const { gitDir, workTree, gitSubDir } = config;
  const repo = { $gitDir: gitDir, $workTree: workTree };

  const filterFiles = <T extends { path: string }>(files: T[]): T[] => {
    if (!gitSubDir) return files;
    const prefix = gitSubDir + '/';
    return files.filter(f => f.path === gitSubDir || f.path.startsWith(prefix));
  };

  // CORS middleware — runs for all routes, before other handlers
  app.use(null, (_req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  });

  // Request logging for API routes
  app.use(null, (req: IncomingMessage, res: ServerResponse) => {
    const pathname = (req as AugmentedRequest).parsedUrl?.pathname ?? req.url ?? '/';
    if (!pathname.startsWith('/api/')) return;
    const start = Date.now();
    res.on('finish', () => {
      logger.request(req.method || 'GET', pathname, res.statusCode, Date.now() - start);
    });
  });

  // Handle preflight OPTIONS requests
  app.use(
    (_, req) => req.method === 'OPTIONS',
    (_req: IncomingMessage, res: ServerResponse) => {
      res.statusCode = 204;
      res.end();
    },
  );

  // GET /api/info — repo info (branch + HEAD hash + path)
  app.use('/api/info', async (_req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    const [branch, head] = await Promise.all([
      git.revParse({ ...repo, $nullOnError: true }, { 'abbrev-ref': true }, 'HEAD'),
      git.revParse({ ...repo, $nullOnError: true }, 'HEAD'),
    ]);
    response.json({ branch, head, path: workTree, subDir: gitSubDir });
  });

  // GET /api/status — list changed files (porcelain format)
  app.use('/api/status', async (_req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    const raw = await git.status(repo, { porcelain: true, u: 'all' });
    response.json({ files: filterFiles(parsePorcelain(raw)) });
  });

  // GET /api/tree — hierarchical file tree from git status
  app.use('/api/tree', async (_req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    const raw = await git.status(repo, { porcelain: true, u: 'all' });
    response.json({ tree: buildTree(filterFiles(parsePorcelain(raw))) });
  });

  // GET /api/diff/staged — staged changes (index vs HEAD)
  app.use('/api/diff/staged', async (_req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    const result = await git.diff(repo, { cached: true });
    response.json({ diff: result });
  });

  // GET /api/diff/file?path=<filepath> — old + new file contents for a specific file
  app.use('/api/diff/file', async (req: IncomingMessage, res: ServerResponse) => {
    const { query } = req as AugmentedRequest;
    const response = res as AugmentedResponse;
    const filePath = query.get('path');
    if (!filePath) {
      response.json({ error: 'Missing "path" query parameter' }, 400);
      return;
    }

    const oldContents = await git.show({ ...repo, $nullOnError: true }, `:${filePath}`);
    let newContents: string;
    try {
      newContents = await readFile(path.join(workTree, filePath), 'utf-8');
    } catch {
      newContents = '';
    }

    response.json({
      oldFile: { name: filePath, contents: oldContents ?? '' },
      newFile: { name: filePath, contents: newContents },
    });
  });

  // GET /api/diff — unstaged changes (working tree vs index)
  app.use('/api/diff', async (_req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    const result = await git.diff(repo);
    response.json({ diff: result });
  });

  // GET /api/log?limit=<n> — recent commits
  app.use('/api/log', async (req: IncomingMessage, res: ServerResponse) => {
    const { query } = req as AugmentedRequest;
    const response = res as AugmentedResponse;
    const limit = Number(query.get('limit')) || 20;

    const raw = await git.log(
      repo,
      { format: '%H%n%h%n%an%n%aI%n%s', n: limit },
    );

    const commits = raw
      ? raw.split('\n').reduce<Array<{ hash: string; abbrev: string; author: string; date: string; message: string }>>(
        (acc, _line, i, lines) => {
          if (i % 5 === 0 && i + 4 < lines.length) {
            acc.push({
              hash: lines[i],
              abbrev: lines[i + 1],
              author: lines[i + 2],
              date: lines[i + 3],
              message: lines[i + 4],
            });
          }
          return acc;
        },
        [],
      )
      : [];

    response.json({ commits });
  });

  // GET /api/commit/<hash> — single commit details + diff
  app.use(/^\/api\/commit\/([a-f0-9]+)$/, async (req: IncomingMessage, res: ServerResponse) => {
    const { params } = req as AugmentedRequest;
    const response = res as AugmentedResponse;
    const hash = params[0];
    const [info, diff] = await Promise.all([
      git.show(repo, { format: '%H%n%h%n%an%n%aI%n%s', 'no-patch': true }, hash),
      git.show(repo, { format: '' }, hash),
    ]);

    const lines = info.split('\n');
    response.json({
      hash: lines[0],
      abbrev: lines[1],
      author: lines[2],
      date: lines[3],
      message: lines[4],
      diff,
    });
  });

  // Static file serving — serves the React client from dist/client/
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(null, serveStatic(path.join(__dirname, 'client')));

  // Global error handler — must be last
  app.use(null, (error: Error, _req: IncomingMessage, res: ServerResponse) => {
    const response = res as AugmentedResponse;
    response.json({ error: error.message }, 500);
  });
}
