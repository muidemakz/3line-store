import { apiClient } from './client';
import type { Product } from './products';
import type { Session } from './sessions';

// ── Types ──────────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  pointsPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  sessionId: string;
  totalPoints: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
  session?: Session;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface CheckoutOrderInput {
  sessionId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrdersFilter {
  status?: OrderStatus;
  sessionId?: string;
  page?: number;
  limit?: number;
}

export interface GlobalShoppingListItem {
  productId: string;
  title: string;
  totalQuantity: number;
}

// ── Service ────────────────────────────────────────────────────
export const ordersService = {
  /**
   * Get the current user's server-side cart.
   */
  async getCart(): Promise<CartItem[]> {
    const result = await apiClient.get<CartItem[]>('/orders/cart');
    return Array.isArray(result) ? result : [];
  },

  /**
   * Add or update an item in the server-side cart.
   * If the item already exists, its quantity is replaced.
   */
  async addToCart(data: AddToCartInput): Promise<CartItem> {
    return apiClient.post<CartItem>('/orders/cart', data);
  },

  /**
   * Trigger checkout against the server-side cart.
   * Validates session, stock, and points — all atomically.
   *
   * Note: AppContext manages a local cart and syncs items to the
   * server before calling this. The backend reads from its own
   * cart table, so items must be added via addToCart() first.
   */
  async checkout(sessionId?: string): Promise<Order> {
    return apiClient.post<Order>('/orders/checkout', sessionId ? { sessionId } : {});
  },

  /**
   * Convenience method used by AppContext:
   * syncs local cart items to the server, then triggers checkout.
   */
  async create(data: CheckoutOrderInput): Promise<Order> {
    // Sync each local cart item to the server cart
    for (const item of data.items) {
      await ordersService.addToCart({
        productId: item.productId,
        quantity: item.quantity,
      });
    }
    // Trigger the transactional checkout, passing the session the user is on
    return ordersService.checkout(data.sessionId);
  },

  /**
   * Get the current user's order history.
   */
  async getMyOrders(filters?: OrdersFilter): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page)   params.set('page', String(filters.page));
    if (filters?.limit)  params.set('limit', String(filters.limit));

    const query = params.toString();
    const path = query ? `/orders/history?${query}` : '/orders/history';

    const result = await apiClient.get<Order[] | { data: Order[] }>(path);
    return Array.isArray(result) ? result : (result as any).data ?? [];
  },

  /**
   * Get the aggregated shopping list for procurement (admin only).
   */
  async getGlobalShoppingList(): Promise<GlobalShoppingListItem[]> {
    const result = await apiClient.get<GlobalShoppingListItem[]>('/orders/admin/shopping-list');
    return Array.isArray(result) ? result : [];
  },
};
