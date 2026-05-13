import { Request, Response } from 'express';
import { suggestionService } from './suggestion.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import { Role } from '../../types';
import type {
  CreateSuggestionInput,
  SuggestionFilterInput,
} from '../../validators/suggestion.validator';

export class SuggestionController {
  createSuggestion = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateSuggestionInput;
    const suggestion = await suggestionService.createSuggestion(req.user!.id, body);
    return sendCreated(res, suggestion, 'Suggestion submitted successfully');
  });

  listSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as unknown as SuggestionFilterInput;
    const result = await suggestionService.listSuggestions(req.user!.id, filters);
    return sendSuccess(res, result.data, 'Suggestions fetched', 200, result.meta);
  });

  getTopRanking = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string | undefined;
    const suggestions = await suggestionService.getTopRanking(req.user!.id, sessionId);
    return sendSuccess(res, suggestions, 'Top 10 suggestions fetched');
  });

  toggleVote = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await suggestionService.toggleVote(req.user!.id, id);
    return sendSuccess(res, { voteCount: updated.voteCount }, 'Vote updated');
  });

  getVoters = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const voters = await suggestionService.getVoters(id);
    return sendSuccess(res, voters, 'Voter details fetched');
  });

  deleteSuggestion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const isAdmin = req.user!.role === Role.ADMIN || req.user!.role === Role.SUPER_ADMIN;
    await suggestionService.deleteSuggestion(id, req.user!.id, isAdmin);
    return sendNoContent(res);
  });
}

export const suggestionController = new SuggestionController();
