import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { env } from '../config/env';

/**
 * Centralised error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Response {
  // ── Zod validation errors ─────────────────────────────────
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.');
      errors[field] = errors[field] ? [...errors[field], e.message] : [e.message];
    });
    return sendError(res, 'Validation failed', StatusCodes.UNPROCESSABLE_ENTITY, errors);
  }

  // ── Operational AppErrors ─────────────────────────────────
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // ── Prisma known request errors ───────────────────────────
  const prismaErr = err as any;
  if (prismaErr.code && typeof prismaErr.code === 'string') {
    if (prismaErr.code === 'P2002') {
      const field = (prismaErr.meta?.target as string[])?.join(', ') ?? 'field';
      return sendError(res, `A record with this ${field} already exists`, StatusCodes.CONFLICT);
    }
    if (prismaErr.code === 'P2025') {
      return sendError(res, 'Record not found', StatusCodes.NOT_FOUND);
    }
  }
  // ── Prisma validation errors ──────────────────────────────
  if (prismaErr.name === 'PrismaClientValidationError') {
    return sendError(res, 'Invalid database query', StatusCodes.BAD_REQUEST);
  }

  // ── Unknown / programmer errors ───────────────────────────
  logger.error('Unhandled error', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });

  const message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;

  return sendError(res, message, StatusCodes.INTERNAL_SERVER_ERROR);
}
