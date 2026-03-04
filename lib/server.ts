import type { IncomingMessage, ServerResponse, Server } from 'node:http';
import logger from './logger';

type MatcherFn = (url: URL, request: IncomingMessage) => boolean;
type Matcher = null | string | RegExp | MatcherFn;
type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void | Promise<void>;
type ErrorHandler = (error: Error, request: IncomingMessage, response: ServerResponse) => void | Promise<void>;
type Handler = RequestHandler | ErrorHandler;

interface MiddlewareEntry {
  matcher: Matcher;
  handlers: Handler[];
}

class FileDiffServer {
  private server: Server;
  private URLConstructor: typeof URL;
  private middleware: MiddlewareEntry[] = [];

  constructor(server: Server, URLConstructor: typeof URL) {
    this.server = server;
    this.URLConstructor = URLConstructor;

    this.server.on('request', (req, res) => {
      this.handleRequest(req, res).catch((err) => {
        logger.error('Unhandled error in request pipeline:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end();
        }
      });
    });
  }

  use(matcher: Matcher, ...handlers: Handler[]): void {
    this.middleware.push({ matcher, handlers });
  }

  listen(port: number, hostname?: string, callback?: () => void): void {
    this.server.listen(port, hostname, callback);
  }

  private matchRoute(matcher: Matcher, pathname: string, url: URL, request: IncomingMessage): RegExpExecArray | boolean {
    if (matcher === null) return true;
    if (typeof matcher === 'string') return pathname === matcher;
    if (matcher instanceof RegExp) return matcher.exec(pathname) || false;
    if (typeof matcher === 'function') return matcher(url, request);
    return false;
  }

  private augmentResponse(response: ServerResponse): ServerResponse {
    const res = response as ServerResponse & {
      json: (data: unknown, statusCode?: number) => void;
      html: (content: string, statusCode?: number) => void;
      text: (content: string, statusCode?: number) => void;
    };

    res.json = (data: unknown, statusCode: number = 200) => {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    res.html = (content: string, statusCode: number = 200) => {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    };

    res.text = (content: string, statusCode: number = 200) => {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'text/plain');
      res.end(content);
    };

    return res;
  }

  private augmentRequest(request: IncomingMessage, parsedUrl: URL, params: string[]): IncomingMessage {
    const req = request as IncomingMessage & {
      parsedUrl: URL;
      params: string[];
      query: URLSearchParams;
    };

    req.parsedUrl = parsedUrl;
    req.params = params;
    req.query = parsedUrl.searchParams;

    return req;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const parsedUrl = new this.URLConstructor(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const response = this.augmentResponse(res);

    let currentError: Error | null = null;

    for (const entry of this.middleware) {
      const match = this.matchRoute(entry.matcher, pathname, parsedUrl, req);
      if (!match) continue;

      // Extract capture groups from RegExp matches
      const params = Array.isArray(match) ? match.slice(1) : [];
      const request = this.augmentRequest(req, parsedUrl, params);

      for (const handler of entry.handlers) {
        if (res.writableEnded) return;

        const isErrorHandler = handler.length === 3;

        if (currentError && !isErrorHandler) continue;
        if (!currentError && isErrorHandler) continue;

        try {
          if (isErrorHandler) {
            await (handler as ErrorHandler)(currentError!, request, response);
          } else {
            await (handler as RequestHandler)(request, response);
          }
        } catch (err) {
          currentError = err instanceof Error ? err : new Error(String(err));
        }
      }
    }

    // If the response is still open, send an appropriate fallback.
    if (!res.writableEnded) {
      if (currentError) {
        res.statusCode = 500;
        res.end();
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    }
  }
}

export default FileDiffServer;
