import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '../utils/helpers';

/**
 * Attaches a unique X-Request-ID header to every request/response
 * for end-to-end tracing across logs and clients.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) ?? generateRequestId();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};
