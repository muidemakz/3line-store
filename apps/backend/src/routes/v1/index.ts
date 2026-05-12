import { Router, Request, Response } from 'express';
import authRoutes from '../../modules/auth/auth.routes';
import userRoutes from '../../modules/users/user.routes';
import productRoutes from '../../modules/products/product.routes';
import sessionRoutes from '../../modules/sessions/session.routes';
import orderRoutes from '../../modules/orders/order.routes';
import suggestionRoutes from '../../modules/suggestions/suggestion.routes';
import uploadRoutes from '../../modules/uploads/upload.routes';
import { sendSuccess, sendNoContent } from '../../utils/apiResponse';
import { prisma } from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// ─── Health check ──────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
      environment: process.env.NODE_ENV ?? 'unknown',
    },
    'API is running',
  );
});

// ─── Module routes ─────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/sessions', sessionRoutes);
router.use('/orders', orderRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/uploads', uploadRoutes);

// ───────────────────────────────────────────────────────────
// GRADE LEVELS (full CRUD — admin only)
// ───────────────────────────────────────────────────────────

const gradeLevelBody = z.object({
  name: z.string().min(1).max(100).trim(),
  defaultPoints: z.number().int().min(0),
});

// List all
router.get(
  '/grade-levels',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (_req: Request, res: Response) => {
    const levels = await prisma.gradeLevel.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, levels, 'Grade levels fetched');
  }),
);

// Create
router.post(
  '/grade-levels',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const body = gradeLevelBody.parse(req.body);
    const existing = await prisma.gradeLevel.findUnique({ where: { name: body.name } });
    if (existing) throw AppError.conflict('A grade level with this name already exists');
    const level = await prisma.gradeLevel.create({ data: body });
    return sendSuccess(res, level, 'Grade level created', 201);
  }),
);

// Update
router.patch(
  '/grade-levels/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = gradeLevelBody.partial().parse(req.body);
    const existing = await prisma.gradeLevel.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Grade level');
    const updated = await prisma.gradeLevel.update({ where: { id }, data: body });
    return sendSuccess(res, updated, 'Grade level updated');
  }),
);

// Delete
router.delete(
  '/grade-levels/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await prisma.gradeLevel.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Grade level');
    await prisma.gradeLevel.delete({ where: { id } });
    return sendNoContent(res);
  }),
);

// ───────────────────────────────────────────────────────────
// SETTINGS — point conversion config (admin only)
// Key: "nairaPerPoint", Value: numeric string e.g. "500"
// ───────────────────────────────────────────────────────────

const NAIRA_PER_POINT_KEY = 'nairaPerPoint';
const DEFAULT_RATE = 500;

// Get current point config
router.get(
  '/settings/point-config',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (_req: Request, res: Response) => {
    const row = await prisma.config.findUnique({ where: { key: NAIRA_PER_POINT_KEY } });
    const nairaPerPoint = row ? Number(row.value) : DEFAULT_RATE;
    return sendSuccess(res, { nairaPerPoint }, 'Point config fetched');
  }),
);

// Update point config — also recalculates pointsPrice for all products
router.put(
  '/settings/point-config',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const { nairaPerPoint } = z.object({
      nairaPerPoint: z.number().min(1, 'Rate must be at least 1'),
    }).parse(req.body);

    // 1. Persist the new rate
    const row = await prisma.config.upsert({
      where: { key: NAIRA_PER_POINT_KEY },
      update: { value: String(nairaPerPoint) },
      create: { key: NAIRA_PER_POINT_KEY, value: String(nairaPerPoint) },
    });

    // 2. Recalculate pointsPrice for every product using the new rate
    const products = await prisma.product.findMany({ select: { id: true, nairaPrice: true } });
    await Promise.all(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { pointsPrice: Math.ceil(Number(p.nairaPrice) / nairaPerPoint) },
        }),
      ),
    );

    return sendSuccess(
      res,
      { nairaPerPoint: Number(row.value), productsUpdated: products.length },
      `Point config updated — ${products.length} product(s) repriced`,
    );
  }),
);

export default router;
