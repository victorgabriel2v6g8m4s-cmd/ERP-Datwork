import cors, { type CorsOptions } from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVER_CONFIG } from './config/serverConfig.js';
import { CustomLogger } from './logger/CustomLogger.js';
import { isAuthenticated } from './middlewares/auth.js';
import { rateLimit } from './middlewares/rateLimit.js';
import { securityHeaders } from './middlewares/securityHeaders.js';
import { router } from './routes.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(currentDirectory, '..', 'uploads');

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || SERVER_CONFIG.http.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error('OriginNotAllowed');
    error.name = 'CorsOriginError';
    callback(error);
  }
};

function resolveErrorStatus(error: unknown): number {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return 413;
  if (error instanceof Error && error.message === 'UnsupportedUploadMimeType') return 415;
  if (error instanceof Error && error.name === 'CorsOriginError') return 403;
  if (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && typeof error.status === 'number'
    && error.status >= 400
    && error.status <= 599
  ) return error.status;
  return 500;
}

function resolvePublicError(status: number): string {
  if (status === 403) return 'OriginNotAllowed';
  if (status === 404) return 'RouteNotFound';
  if (status === 413) return 'PayloadTooLarge';
  if (status === 415) return 'UnsupportedMediaType';
  if (status >= 400 && status < 500) return 'RequestRejected';
  return 'InternalServerError';
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (SERVER_CONFIG.runtime.trustProxy) app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(rateLimit);
  app.use(express.json({ limit: SERVER_CONFIG.http.jsonBodyLimit }));

  app.get('/health', (_req, res) => res.status(200).json({
    status: 'ok',
    environment: SERVER_CONFIG.runtime.environment
  }));

  app.use('/files', isAuthenticated, express.static(uploadsDirectory, {
    dotfiles: 'deny',
    index: false,
    fallthrough: false
  }));

  app.use(router);

  app.use((_req, res) => res.status(404).json({ error: 'RouteNotFound' }));

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    const status = resolveErrorStatus(error);
    if (status >= 500) {
      CustomLogger.error(`[HTTP] Unhandled ${req.method} ${req.url}`, error);
    } else {
      CustomLogger.warn(`[HTTP] Rejected ${req.method} ${req.url}`, { status });
    }
    return res.status(status).json({ error: resolvePublicError(status) });
  });

  return app;
}
