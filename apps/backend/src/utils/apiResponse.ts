import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../types';

/**
 * Sends a standardised success JSON response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = StatusCodes.OK,
  meta?: Record<string, unknown>,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
}

/**
 * Sends a standardised created (201) JSON response.
 */
export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): Response {
  return sendSuccess(res, data, message, StatusCodes.CREATED);
}

/**
 * Sends a standardised error JSON response.
 * Prefer throwing AppError instead of calling this directly.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  errors?: Record<string, string[]>,
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
}

/**
 * Sends a 204 No Content response.
 */
export function sendNoContent(res: Response): Response {
  return res.status(StatusCodes.NO_CONTENT).send();
}
