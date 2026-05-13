import { Request, Response, NextFunction } from 'express';
import { UserStatus } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { Role } from '../types';

/**
 * Validates Bearer token and attaches `req.user` from the database.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No bearer token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw AppError.forbidden('Your account has been suspended');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw AppError.forbidden('Your account is inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'ADMIN'
    };
    next();
  },
);

/**
 * Role-based authorisation guard.
 * Must be used AFTER `authenticate`.
 *
 * @example router.delete('/users/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), handler)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw AppError.forbidden(`Access denied. Required role(s): ${allowedRoles.join(', ')}`);
    }

    next();
  };
};
