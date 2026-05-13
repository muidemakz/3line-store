import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload, AuthTokens } from '../types';
import { AppError } from './AppError';

/**
 * Signs an access token (short-lived).
 */
export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Signs a refresh token (long-lived).
 */
export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Generates both access and refresh tokens.
 */
export function generateAuthTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): AuthTokens {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

/**
 * Verifies an access token. Throws AppError on failure.
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token has expired');
    }
    throw AppError.unauthorized('Invalid access token');
  }
}

/**
 * Verifies a refresh token. Throws AppError on failure.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token has expired — please log in again');
    }
    throw AppError.unauthorized('Invalid refresh token');
  }
}
