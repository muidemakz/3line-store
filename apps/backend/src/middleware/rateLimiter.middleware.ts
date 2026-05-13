import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';

/**
 * General API rate limiter applied globally.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

/**
 * Strict rate limiter for sensitive auth endpoints (login, register, forgot-password).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? 'unknown',
  handler: (_req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many authentication attempts — try again in 15 minutes.',
    });
  },
});
