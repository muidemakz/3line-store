import { apiClient } from './client';

export interface SuggestionUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Suggestion {
  id: string;
  userId: string;
  sessionId: string;
  title: string;
  description: string;
  imageUrl?: string;
  voteCount: number;
  hasVoted: boolean;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
  user: SuggestionUser;
}

export interface CreateSuggestionInput {
  title: string;
  description: string;
  sessionId: string;
  imageUrl?: string;
}

export const suggestionsService = {
  /** Top 10 for the marketplace demand chart */
  async getTopRanking(sessionId?: string): Promise<Suggestion[]> {
    const path = sessionId
      ? `/suggestions/ranking?sessionId=${sessionId}`
      : '/suggestions/ranking';
    const result = await apiClient.get<Suggestion[]>(path);
    return Array.isArray(result) ? result : [];
  },

  /** All suggestions — used by admin */
  async getAll(sessionId?: string): Promise<Suggestion[]> {
    const path = sessionId
      ? `/suggestions?sessionId=${sessionId}`
      : '/suggestions';
    const result = await apiClient.get<Suggestion[] | { data: Suggestion[] }>(path);
    return Array.isArray(result) ? result : (result as any).data ?? [];
  },

  /** Create a suggestion */
  async create(data: CreateSuggestionInput): Promise<Suggestion> {
    return apiClient.post<Suggestion>('/suggestions', data);
  },

  /** Toggle vote (add if not voted, remove if voted) */
  async toggleVote(id: string): Promise<{ voteCount: number }> {
    return apiClient.post<{ voteCount: number }>(`/suggestions/${id}/vote`);
  },
};
