import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { parsePagination, buildPaginationMeta } from '../../utils/helpers';
import type {
  CreateSuggestionInput,
  SuggestionFilterInput,
} from '../../validators/suggestion.validator';

export class SuggestionService {
  /**
   * Create a new suggestion
   */
  async createSuggestion(userId: string, data: CreateSuggestionInput) {
    const session = await prisma.session.findUnique({ where: { id: data.sessionId } });
    if (!session) throw AppError.notFound('Session');

    return prisma.suggestion.create({
      data: { userId, ...data },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * List ALL suggestions (used by admin).
   * Includes hasVoted and isOwner for the requesting user,
   * plus the full voter list.
   */
  async listSuggestions(userId: string, filters: SuggestionFilterInput) {
    const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit });

    // Suggestions are global — show all regardless of session
    const where = {};

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [filters.sortBy]: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          votes: {
            // Use select (not include) to avoid querying updatedAt which may
            // not exist in older DB deployments
            select: {
              id:          true,
              userId:      true,
              suggestionId: true,
              createdAt:   true,
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      prisma.suggestion.count({ where }),
    ]);

    const shaped = suggestions.map(s => ({
      ...s,
      hasVoted: s.votes.some(v => v.userId === userId),
      isOwner: s.userId === userId,
    }));

    return { data: shaped, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get Top 10 suggestions for marketplace users.
   * Includes hasVoted + isOwner for the requesting user.
   * Does NOT expose the full voter list to regular users.
   */
  async getTopRanking(userId: string, _sessionId?: string) {
    // Suggestions are global — top ranking shows all suggestions regardless of session
    const suggestions = await prisma.suggestion.findMany({
      take: 10,
      orderBy: { voteCount: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        votes: { where: { userId }, select: { id: true } },
      },
    });

    return suggestions.map(({ votes, ...s }) => ({
      ...s,
      hasVoted: votes.length > 0,
      isOwner: s.userId === userId,
    }));
  }

  /**
   * Toggle vote on a suggestion:
   *  - If user hasn't voted → add vote, increment counter
   *  - If user has voted   → remove vote, decrement counter
   * Owners cannot vote on their own suggestions.
   */
  async toggleVote(userId: string, suggestionId: string) {
    const suggestion = await prisma.suggestion.findUnique({ where: { id: suggestionId } });
    if (!suggestion) throw AppError.notFound('Suggestion');

    if (suggestion.userId === userId) {
      throw AppError.badRequest('You cannot vote on your own suggestion.');
    }

    const existingVote = await prisma.suggestionVote.findUnique({
      where: { userId_suggestionId: { userId, suggestionId } },
    });

    return prisma.$transaction(async (tx) => {
      if (existingVote) {
        // Remove vote
        await tx.suggestionVote.delete({
          where: { userId_suggestionId: { userId, suggestionId } },
        });
        return tx.suggestion.update({
          where: { id: suggestionId },
          data: { voteCount: { decrement: 1 } },
        });
      } else {
        // Add vote
        await tx.suggestionVote.create({ data: { userId, suggestionId } });
        return tx.suggestion.update({
          where: { id: suggestionId },
          data: { voteCount: { increment: 1 } },
        });
      }
    });
  }

  /**
   * [ADMIN] Get full voter details for a suggestion
   */
  async getVoters(suggestionId: string) {
    return prisma.suggestionVote.findMany({
      where: { suggestionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            gradeLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete suggestion (Owner or Admin)
   */
  async deleteSuggestion(id: string, userId: string, isAdmin: boolean) {
    const suggestion = await prisma.suggestion.findUnique({ where: { id } });
    if (!suggestion) throw AppError.notFound('Suggestion');

    if (!isAdmin && suggestion.userId !== userId) {
      throw AppError.forbidden('You can only delete your own suggestions');
    }

    await prisma.suggestion.delete({ where: { id } });
  }
}

export const suggestionService = new SuggestionService();
