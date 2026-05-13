import { z } from 'zod';

export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100),
  startDate: z.string().datetime({ message: 'Invalid start date format' }),
  endDate: z.string().datetime({ message: 'Invalid end date format' }),
  isActive: z.boolean().optional().default(false),
});

export const updateSessionSchema = createSessionSchema.partial();

export const allocatePointsSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userIds: z.array(z.string().min(1)).min(1, 'At least one user must be selected'),
  // If points not provided, use grade-level defaults
  points: z.number().int().min(0).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type AllocatePointsInput = z.infer<typeof allocatePointsSchema>;
