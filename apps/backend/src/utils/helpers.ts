import { v4 as uuidv4 } from 'uuid';
import { PAGINATION_DEFAULTS } from '../config/constants';
import { PaginationQuery } from '../types';

/**
 * Generates a unique request ID (UUID v4).
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Sanitises and normalises pagination query parameters.
 */
export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.limit),
  );
  const skip = (page - 1) * limit;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, skip, sortBy: query.sortBy, sortOrder };
}

/**
 * Builds paginated result metadata.
 */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Strips sensitive fields from a user object before sending in response.
 */
export function excludeFields<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as K))) as Omit<
    T,
    K
  >;
}
