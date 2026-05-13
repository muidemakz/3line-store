import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { UPLOADS_DIR } from './middleware/upload.middleware';

import { env } from './config/env';
import { API_PREFIX } from './config/constants';
import { httpLogger } from './middleware/logger.middleware';
import { requestId } from './middleware/requestId.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { notFound } from './middleware/notFound.middleware';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  // ── Security headers ──────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (env.ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID'],
    }),
  );

  // ── Request ID ────────────────────────────────────────────
  app.use(requestId);

  // ── HTTP logging ──────────────────────────────────────────
  app.use(httpLogger);

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── Compression ───────────────────────────────────────────
  app.use(compression());

  // ── Global rate limiting ──────────────────────────────────
  app.use(globalRateLimiter);

  // ── Trust proxy (required if behind nginx / load balancer)
  app.set('trust proxy', 1);

  // ── Static uploads folder ─────────────────────────────────
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ── API routes ────────────────────────────────────────────
  app.use(API_PREFIX, apiRouter);

  // ── 404 handler ───────────────────────────────────────────
  app.use(notFound);

  // ── Centralised error handler (must be last) ──────────────
  app.use(errorHandler);

  return app;
}
