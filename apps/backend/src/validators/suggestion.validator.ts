import { z } from 'zod';

export const createSuggestionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().default(''),
  sessionId: z.string().min(1, 'Session ID is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

export const updateSuggestionSchema = createSuggestionSchema.omit({ sessionId: true }).partial();

export const suggestionFilterSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').optional(),
  sortBy: z.enum(['voteCount', 'createdAt']).optional().default('voteCount'),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
});

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;
export type SuggestionFilterInput = z.infer<typeof suggestionFilterSchema>;
