import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import { parsePagination, buildPaginationMeta, excludeFields } from '../../utils/helpers';
import { AppError } from '../../utils/AppError';
import { EmailService } from '../../services/email.service';
import { PaginationQuery } from '../../types';
import type { AdminCreateUserInput, UpdateUserStatusInput, UpdateUserInput } from '../../validators/user.validator';

// ─── Helper: generate a readable temporary password ───────────────────────────
function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';

  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];

  // Guarantee at least one of each required character type
  const required = [rand(upper), rand(lower), rand(digits), rand(special)];

  // Fill remaining chars (total length = 10)
  const all = upper + lower + digits + special;
  const extra = Array.from({ length: 6 }, () => rand(all));

  // Shuffle
  return [...required, ...extra]
    .sort(() => Math.random() - 0.5)
    .join('');
}

// ─── Controller ───────────────────────────────────────────────────────────────
export class UserController {
  /**
   * GET /api/v1/users
   * [ADMIN ONLY] List all users with pagination
   */
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(req.query as unknown as PaginationQuery);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          gradeLevel: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count(),
    ]);

    const sanitizedUsers = users.map((u) => excludeFields(u, ['password']));
    const meta = buildPaginationMeta(total, page, limit);

    return sendSuccess(res, sanitizedUsers, 'Users fetched successfully', 200, meta);
  });

  /**
   * POST /api/v1/users
   * [ADMIN ONLY] Create a new user and email them their credentials
   */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as AdminCreateUserInput;

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw AppError.conflict('A user with this email already exists');
    }

    // Validate gradeLevelId if provided
    if (body.gradeLevelId) {
      const gl = await prisma.gradeLevel.findUnique({ where: { id: body.gradeLevelId } });
      if (!gl) throw AppError.notFound('Grade level');
    }

    // Generate & hash temp password
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Resolve grade level
    const gradeLevel = body.gradeLevelId
      ? await prisma.gradeLevel.findUnique({ where: { id: body.gradeLevelId } })
      : null;

    // Create user first (without points — we'll upsert them below)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: body.role,
        gradeLevelId: gradeLevel?.id ?? body.gradeLevelId ?? null,
        profile: { create: {} },
      },
      include: {
        gradeLevel: true,
      },
    });

    // Enroll new user in ALL currently active sessions (any role with a grade level)
    if (gradeLevel) {
      const activeSessions = await prisma.session.findMany({ where: { isActive: true } });
      for (const session of activeSessions) {
        await prisma.userSessionPoints.upsert({
          where: { userId_sessionId: { userId: user.id, sessionId: session.id } },
          update: { allocatedPoints: gradeLevel.defaultPoints, remainingPoints: gradeLevel.defaultPoints },
          create: {
            userId: user.id,
            sessionId: session.id,
            allocatedPoints: gradeLevel.defaultPoints,
            remainingPoints: gradeLevel.defaultPoints,
          },
        });
      }
    }

    // Send welcome email (fire-and-forget — don't block the response)
    EmailService.sendWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: tempPassword,
    }).catch(() => {
      // Email failure should not break the API response
    });

    return sendCreated(
      res,
      { ...excludeFields(user, ['password']), tempPassword },
      'User created successfully',
    );
  });

  /**
   * PATCH /api/v1/users/:id
   * [ADMIN ONLY] Full user edit — name, email, role, grade level, phone
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateUserInput;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');

    // Check email uniqueness if email is being changed
    if (body.email && body.email !== user.email) {
      const conflict = await prisma.user.findUnique({ where: { email: body.email } });
      if (conflict) throw AppError.conflict('A user with this email already exists');
    }

    // Validate gradeLevelId if provided
    if (body.gradeLevelId) {
      const gl = await prisma.gradeLevel.findUnique({ where: { id: body.gradeLevelId } });
      if (!gl) throw AppError.notFound('Grade level');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.firstName    != null && { firstName:    body.firstName }),
        ...(body.lastName     != null && { lastName:     body.lastName }),
        ...(body.email        != null && { email:        body.email }),
        ...(body.phone        !== undefined && { phone:  body.phone }),
        ...(body.role         != null && { role:         body.role as any }),
        ...(body.gradeLevelId !== undefined && { gradeLevelId: body.gradeLevelId }),
      },
      include: { gradeLevel: true },
    });

    // If grade level changed, update points for all active sessions
    if (body.gradeLevelId !== undefined && updated.gradeLevel) {
      const newPoints = updated.gradeLevel.defaultPoints;
      const activeSessions = await prisma.session.findMany({ where: { isActive: true } });
      for (const session of activeSessions) {
        await prisma.userSessionPoints.upsert({
          where: { userId_sessionId: { userId: id, sessionId: session.id } },
          update: { allocatedPoints: newPoints, remainingPoints: newPoints },
          create: { userId: id, sessionId: session.id, allocatedPoints: newPoints, remainingPoints: newPoints },
        });
      }
    }

    return sendSuccess(res, excludeFields(updated, ['password']), 'User updated successfully');
  });

  /**
   * PATCH /api/v1/users/:id/status
   * [ADMIN ONLY] Activate / deactivate / suspend a user
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateUserStatusInput;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');

    const updated = await prisma.user.update({
      where: { id },
      data: { status: body.status as any },
      include: { gradeLevel: true },
    });

    return sendSuccess(res, excludeFields(updated, ['password']), 'User status updated');
  });

  /**
   * DELETE /api/v1/users/:id
   * [ADMIN ONLY] Hard-delete a user
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');

    // Orders have no CASCADE on userId in the DB yet, so we remove them first.
    // OrderItems cascade automatically when their parent order is deleted.
    await prisma.order.deleteMany({ where: { userId: id } });

    // Now delete the user — all other relations (profile, sessionPoints,
    // cartItems, suggestions, votes, tokens) already have onDelete: Cascade.
    await prisma.user.delete({ where: { id } });

    return sendNoContent(res);
  });
}

export const userController = new UserController();
