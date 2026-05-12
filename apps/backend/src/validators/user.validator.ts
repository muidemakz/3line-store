import { z } from 'zod';
import { Role } from '../types';

// ─── Admin: Create User ───────────────────────────────────────────────────────
export const adminCreateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).trim(),
  lastName: z.string().min(1, 'Last name is required').max(50).trim(),
  email: z.string().email('Invalid email').toLowerCase().trim(),
  role: z.nativeEnum(Role).default(Role.USER),
  gradeLevelId: z.string().optional(),
  phone: z.string().optional(),
});

// ─── Admin: Update User Status ────────────────────────────────────────────────
export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

// ─── Admin: Full User Edit ────────────────────────────────────────────────────
export const updateUserSchema = z.object({
  firstName:    z.string().min(1).max(50).trim().optional(),
  lastName:     z.string().min(1).max(50).trim().optional(),
  email:        z.string().email().toLowerCase().trim().optional(),
  phone:        z.string().optional().nullable(),
  role:         z.nativeEnum(Role).optional(),
  gradeLevelId: z.string().optional().nullable(),
});

export type AdminCreateUserInput  = z.infer<typeof adminCreateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserInput       = z.infer<typeof updateUserSchema>;
