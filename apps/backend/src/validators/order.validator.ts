import { z } from 'zod';

// ─── Cart Validators ───────────────────────────────────────
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// ─── Checkout Validators ───────────────────────────────────
export const checkoutSchema = z.object({
  //sessionId is usually inferred from active session, but can be provided
  sessionId: z.string().min(1).optional(),
});

// ─── Filter Validators ─────────────────────────────────────
export const orderFilterSchema = z.object({
  status:    z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  sessionId: z.string().optional(),
  page:      z.string().optional().default('1').transform(Number),
  limit:     z.string().optional().default('20').transform(Number),
});

// ─── Admin: Create Order on behalf of a user ──────────────
export const adminCreateOrderSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userId:    z.string().min(1, 'User ID is required'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity:  z.number().int().min(1),
  })).min(1, 'At least one item is required'),
});

export type AddToCartInput         = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput    = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput          = z.infer<typeof checkoutSchema>;
export type OrderFilterInput       = z.infer<typeof orderFilterSchema>;
export type AdminCreateOrderInput  = z.infer<typeof adminCreateOrderSchema>;
