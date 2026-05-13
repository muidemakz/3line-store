import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import type {
  CreateSessionInput,
  UpdateSessionInput,
  AllocatePointsInput,
} from '../../validators/session.validator';

export class SessionService {
  /**
   * Create a new session
   */
  async createSession(data: CreateSessionInput) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) throw AppError.badRequest('End date must be after start date');

    return prisma.session.create({
      data: { ...data, startDate: start, endDate: end },
    });
  }

  /**
   * Update session details (name, startDate, endDate)
   */
  async updateSession(id: string, data: UpdateSessionInput) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw AppError.notFound('Session');

    const start = data.startDate ? new Date(data.startDate) : undefined;
    const end = data.endDate ? new Date(data.endDate) : undefined;

    if (start && end && start >= end) {
      throw AppError.badRequest('End date must be after start date');
    }

    return prisma.session.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(start && { startDate: start }),
        ...(end && { endDate: end }),
      },
    });
  }

  /**
   * Activate a session (multiple can be active simultaneously).
   * Auto-allocates grade-level points to all active USER accounts
   * for this session. Other sessions' points are untouched.
   */
  async activateSession(id: string, dates?: { startDate: string; endDate: string }) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw AppError.notFound('Session');

    const start = dates?.startDate ? new Date(dates.startDate) : undefined;
    const end = dates?.endDate ? new Date(dates.endDate) : undefined;

    if (start && end && start >= end) {
      throw AppError.badRequest('End date must be after start date');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Activate the session (optionally update dates)
      const activated = await tx.session.update({
        where: { id },
        data: {
          isActive: true,
          ...(start && { startDate: start }),
          ...(end && { endDate: end }),
        },
      });

      // 2. Fetch all active users with a grade level (includes ADMIN users
      //    so they also see points when browsing the marketplace)
      const users = await tx.user.findMany({
        where: { status: 'ACTIVE', gradeLevel: { isNot: null } },
        include: { gradeLevel: true },
      });

      // 3. Upsert points for each user — scoped to this session only
      for (const user of users) {
        const points = user.gradeLevel?.defaultPoints ?? 0;
        await tx.userSessionPoints.upsert({
          where: { userId_sessionId: { userId: user.id, sessionId: id } },
          update: { allocatedPoints: points, remainingPoints: points },
          create: {
            userId: user.id,
            sessionId: id,
            allocatedPoints: points,
            remainingPoints: points,
          },
        });
      }

      return activated;
    });
  }

  /**
   * Deactivate a session without affecting any other session.
   */
  async deactivateSession(id: string) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw AppError.notFound('Session');
    return prisma.session.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * List sessions.
   * - Admins: all sessions
   * - Regular users: only active sessions (so the marketplace only shows live sessions)
   */
  async listSessions(onlyActive = false) {
    return prisma.session.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { products: true, orders: true, userPoints: true } },
      },
    });
  }

  /**
   * Allocate points to specific users for a session (manual override).
   */
  async allocatePoints(data: AllocatePointsInput) {
    const session = await prisma.session.findUnique({ where: { id: data.sessionId } });
    if (!session) throw AppError.notFound('Session');

    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const userId of data.userIds) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { gradeLevel: true },
        });
        if (!user) continue;

        const pointsToAssign = data.points ?? user.gradeLevel?.defaultPoints ?? 0;
        const record = await tx.userSessionPoints.upsert({
          where: { userId_sessionId: { userId, sessionId: data.sessionId } },
          update: { allocatedPoints: pointsToAssign, remainingPoints: pointsToAssign },
          create: {
            userId,
            sessionId: data.sessionId,
            allocatedPoints: pointsToAssign,
            remainingPoints: pointsToAssign,
          },
        });
        results.push(record);
      }
      return results;
    });
  }

  /**
   * Get user remaining points for a specific (or active) session.
   */
  async getUserPoints(userId: string, sessionId?: string) {
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const active = await prisma.session.findFirst({ where: { isActive: true } });
      targetSessionId = active?.id;
    }
    if (!targetSessionId) throw AppError.notFound('No active session found');

    const points = await prisma.userSessionPoints.findUnique({
      where: { userId_sessionId: { userId, sessionId: targetSessionId } },
      include: { session: true },
    });

    if (!points) return { remainingPoints: 0, allocatedPoints: 0, sessionName: 'None' };
    return points;
  }

  /**
   * Auto-deactivate sessions whose endDate has passed (called by cron).
   */
  async handleExpirations() {
    const now = new Date();
    const result = await prisma.session.updateMany({
      where: { isActive: true, endDate: { lt: now } },
      data: { isActive: false },
    });
    return result.count;
  }
}

export const sessionService = new SessionService();
