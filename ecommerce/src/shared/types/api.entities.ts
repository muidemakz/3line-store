/**
 * API entity shapes shared conceptually with the admin portal and backend.
 * When you extract a workspace package (e.g. `@3line-store/api-types`), move these
 * definitions there and import from both apps.
 */

/** Authenticated user (customer-facing store). */
export interface User {
  id: string;
  email: string;
  name: string;
  /** Grade level drives allocated points; set by SuperAdmin. */
  gradeLevelId?: string;
  gradeLevelLabel?: string;
}

/**
 * Palliative session assigned to the user by SuperAdmin.
 * Admin “session details” and storefront dashboard should reflect the same `id`.
 */
export interface Session {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'ended' | 'draft';
  startsAt?: string;
  endsAt?: string;
}

/** Catalog item — backend may use string UUIDs; legacy mocks may use numeric ids. */
export interface Product {
  id: string | number;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
  thumbnail: string;
}

export interface ProductsListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderLine {
  productId: string | number;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  sessionId?: string;
  status: OrderStatus;
  lines: OrderLine[];
  totalPoints?: number;
  totalCurrency?: number;
  createdAt: string;
}

/** Suggestion submitted to SuperAdmin. */
export interface Suggestion {
  id: string;
  message: string;
  status: 'open' | 'reviewed' | 'closed';
  createdAt: string;
}

/** Naira-to-points conversion — sourced from admin settings. */
export interface PointsSettings {
  nairaToPointsRate: number;
}
