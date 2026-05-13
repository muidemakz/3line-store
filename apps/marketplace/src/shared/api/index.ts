// ── Client & utilities ─────────────────────────────────────────
export { apiClient, tokenStorage } from './client';
export type { ApiResponse, ApiError } from './client';

// ── Auth ───────────────────────────────────────────────────────
export { authService } from './auth';
export type { User, AuthTokens, AuthResponse, LoginInput, RegisterInput } from './auth';

// ── Products ───────────────────────────────────────────────────
export { productsService } from './products';
export type {
  Product,
  ProductsFilter,
  CreateProductInput,
  UpdateProductInput,
} from './products';

// ── Sessions ───────────────────────────────────────────────────
export { sessionsService } from './sessions';
export type {
  Session,
  UserSessionPoints,
  UserPointsResponse,
  CreateSessionInput,
  AllocatePointsInput,
} from './sessions';

// ── Orders ─────────────────────────────────────────────────────
export { ordersService } from './orders';
export type {
  Order,
  OrderItem,
  OrderStatus,
  CartItem,
  AddToCartInput,
  CheckoutOrderInput,
  OrdersFilter,
  GlobalShoppingListItem,
} from './orders';
