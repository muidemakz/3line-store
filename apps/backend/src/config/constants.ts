export const API_PREFIX = '/api';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const PASSWORD_RESET_EXPIRY_MINUTES = 30;

export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const HTTP_MESSAGES = {
  OK: 'Success',
  CREATED: 'Resource created successfully',
  NO_CONTENT: 'No content',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized — please authenticate',
  FORBIDDEN: 'Forbidden — insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  UNPROCESSABLE: 'Validation failed',
  INTERNAL: 'Internal server error',
} as const;
