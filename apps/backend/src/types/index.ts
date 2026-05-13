import { Role, UserStatus } from '@prisma/client';

// ============================================================
// SHARED UTILITY TYPES
// ============================================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
}

// ============================================================
// REQUEST TYPES (Zod-inferred — imported from validators)
// ============================================================

export { Role, UserStatus, OrderStatus } from '@prisma/client';
