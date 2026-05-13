import { z } from 'zod';

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((v) => v > 0, 'Page must be a positive number'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .refine((v) => v > 0 && v <= 100, 'Limit must be between 1 and 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
