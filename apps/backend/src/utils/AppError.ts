import { StatusCodes } from 'http-status-codes';

/**
 * Custom operational error class.
 * Distinguishes between operational errors (expected, handled)
 * and programmer errors (bugs, unhandled).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]>,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Static factory methods ─────────────────────────────────

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new AppError(message, StatusCodes.BAD_REQUEST, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, StatusCodes.FORBIDDEN);
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, StatusCodes.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, StatusCodes.CONFLICT);
  }

  static unprocessable(message: string, errors?: Record<string, string[]>) {
    return new AppError(message, StatusCodes.UNPROCESSABLE_ENTITY, errors);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR, undefined, false);
  }
}
