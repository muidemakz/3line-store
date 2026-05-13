import morgan, { StreamOptions } from 'morgan';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Pipe Morgan output into Winston
const stream: StreamOptions = {
  write: (message) => logger.http(message.trimEnd()),
};

// Skip logging for non-error responses in test environment
const skip = (_req: Request, _res: Response): boolean => {
  if (env.NODE_ENV === 'test') return true;
  return false;
};

/**
 * HTTP request logger using Morgan + Winston.
 * Format: :method :url :status :response-time ms - :res[content-length]
 */
export const httpLogger = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream,
  skip,
});
