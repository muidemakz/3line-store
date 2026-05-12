import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/apiResponse';

/**
 * 404 handler — must be registered AFTER all routes.
 */
export const notFound = (req: Request, res: Response): Response => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, StatusCodes.NOT_FOUND);
};
