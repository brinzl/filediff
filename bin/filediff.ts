#!/usr/bin/env node

import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { URL } from 'node:url';
import argv from '@lib/argv';
import FileDiffServer from '@lib/server';
import registerRoutes from '@lib/routes';
import {open} from '@lib/utils';
import logger from '@lib/logger';

const args = argv(process.argv.slice(2));

if (args.help || args.h) {
  console.log(`filediff - browser-based git diff viewer

Usage:
  filediff [options]

Options:
  -d, --dir <path>       Directory to serve (default: .)
  -p, --port <number>    Port number (default: 4321)
  -s, --sub-dir <path>   Filter to a subdirectory within the repo
  -o, --open             Auto-open the browser
  -h, --help             Show this help message`);
  process.exit(0);
}

const dir = path.resolve(String(args.dir || args.d || '.'));
const port = Number(args.port || args.p || 4321);
const rawSubDir = args['sub-dir'] || args.s;
const gitSubDir = rawSubDir ? String(rawSubDir).replace(/^\/+|\/+$/g, '') : undefined;

if (!fs.existsSync(dir)) {
  logger.error(`directory "${dir}" does not exist.`);
  process.exit(1);
}

// Validate it's a git repo
const gitDir = path.join(dir, '.git');
if (!fs.existsSync(gitDir)) {
  logger.error(`"${dir}" is not a git repository (no .git directory found).`);
  process.exit(1);
}

if (gitSubDir && !fs.existsSync(path.join(dir, gitSubDir))) {
  logger.warn(`sub-directory "${gitSubDir}" does not exist in "${dir}" (deleted files may still appear).`);
  process.exit(1);
}

const app = new FileDiffServer(http.createServer(), URL as unknown as typeof globalThis.URL);
registerRoutes(app, { gitDir, workTree: dir, gitSubDir });
const url = `http://127.0.0.1:${port}`;

app.listen(port, '127.0.0.1', () => {
  logger.info(`filediff server running at ${url}`);
  logger.info(`serving repo: ${dir}`);
  if (gitSubDir) logger.info(`filtered to: ${gitSubDir}/`);
  if (args.open || args.o) open(url);
});
