import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────
export interface Product {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  image: string | null;
  nairaPrice: number;
  pointsPrice: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsFilter {
  sessionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  sessionId: string;
  title: string;
  description: string;
  nairaPrice: number;
  pointsPrice: number;
  stockQuantity: number;
  image?: string;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  nairaPrice?: number;
  pointsPrice?: number;
  stockQuantity?: number;
  image?: string;
}

// ── Service ────────────────────────────────────────────────────
export const productsService = {
  /**
   * Get all products, optionally filtered.
   */
  async getAll(filters?: ProductsFilter): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.set('sessionId', filters.sessionId);
    if (filters?.search)    params.set('search', filters.search);
    if (filters?.page)      params.set('page', String(filters.page));
    if (filters?.limit)     params.set('limit', String(filters.limit));

    const query = params.toString();
    const path = query ? `/products?${query}` : '/products';
    const result = await apiClient.get<Product[] | { data: Product[] }>(path);

    // Handle both paginated and flat array responses
    return Array.isArray(result) ? result : (result as any).data ?? [];
  },

  /**
   * Get a single product by ID.
   */
  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Create a new product (admin only).
   */
  async create(data: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>('/products', data);
  },

  /**
   * Update an existing product (admin only).
   */
  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return apiClient.patch<Product>(`/products/${id}`, data);
  },

  /**
   * Delete a product (admin only).
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/products/${id}`);
  },
};
