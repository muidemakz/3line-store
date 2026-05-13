import { Request, Response } from 'express';
import { sessionService } from './session.service';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types';
import type {
  CreateSessionInput,
  UpdateSessionInput,
  AllocatePointsInput,
} from '../../validators/session.validator';

export class SessionController {
  createSession = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateSessionInput;
    const session = await sessionService.createSession(body);
    return sendCreated(res, session, 'Session created successfully');
  });

  updateSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateSessionInput;
    const session = await sessionService.updateSession(id, body);
    return sendSuccess(res, session, 'Session updated successfully');
  });

  /**
   * GET /sessions
   * Admins → all sessions
   * Regular users → active sessions only
   */
  listSessions = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === Role.ADMIN || req.user?.role === Role.SUPER_ADMIN;
    const sessions = await sessionService.listSessions(!isAdmin);
    return sendSuccess(res, sessions, 'Sessions fetched');
  });

  activateSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate } = req.body ?? {};
    const session = await sessionService.activateSession(id, startDate && endDate ? { startDate, endDate } : undefined);
    return sendSuccess(res, session, 'Session activated successfully');
  });

  deactivateSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = await sessionService.deactivateSession(id);
    return sendSuccess(res, session, 'Session deactivated');
  });

  allocatePoints = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as AllocatePointsInput;
    const results = await sessionService.allocatePoints(body);
    return sendSuccess(res, results, `Points allocated to ${results.length} users`);
  });

  // Returns ALL session points for the user as an array
  getUserPoints = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    const userPoints = await prisma.userSessionPoints.findMany({
      where: { userId },
      include: { session: true },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, userPoints, 'User points fetched');
  });
}

export const sessionController = new SessionController();
