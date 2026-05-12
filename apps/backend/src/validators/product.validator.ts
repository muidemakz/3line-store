import { z } from 'zod';

export const createProductSchema = z.object({
  sessionId: z.string().optional(),           // auto-assigned to active session if omitted
  title: z.string().min(1, 'Title is required').max(200),
  brand: z.string().max(100).optional(),
  unit: z.string().max(100).optional(),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Invalid image URL').optional(),
  nairaPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  pointsPrice: z.coerce.number().int().min(0, 'Points cannot be negative').optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  sessionId: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
