import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────
export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSessionPoints {
  id: string;
  userId: string;
  sessionId: string;
  allocatedPoints: number;
  remainingPoints: number;
  createdAt: string;
  updatedAt: string;
  session?: Session;
}

export interface UserPointsResponse {
  remainingPoints: number;
  allocatedPoints: number;
  sessionName: string;
  sessionId?: string;
  session?: Session;
}

export interface CreateSessionInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AllocatePointsInput {
  sessionId: string;
  userIds: string[];
  points?: number;
}

// ── Service ────────────────────────────────────────────────────
export const sessionsService = {
  /**
   * Get the current user's points balance.
   * Defaults to the active session if no sessionId is provided.
   * Available to all authenticated users.
   */
  async getUserPoints(sessionId?: string): Promise<UserSessionPoints[]> {
    const path = sessionId
      ? `/sessions/my-points?sessionId=${sessionId}`
      : '/sessions/my-points';

    const result = await apiClient.get<UserPointsResponse | UserSessionPoints[]>(path);

    // Backend returns a single object for the active session — normalise to array
    if (Array.isArray(result)) return result;

    // Wrap single response in array so AppContext can use .find()
    const single = result as UserPointsResponse;
    if (!single.sessionId) return [];

    return [{
      id: '',
      userId: '',
      sessionId: single.sessionId,
      allocatedPoints: single.allocatedPoints,
      remainingPoints: single.remainingPoints,
      createdAt: '',
      updatedAt: '',
      session: single.session,
    }];
  },

  /**
   * List all sessions (admin only).
   */
  async getAll(): Promise<Session[]> {
    const result = await apiClient.get<Session[] | { data: Session[] }>('/sessions');
    return Array.isArray(result) ? result : (result as any).data ?? [];
  },

  /**
   * Create a new session (admin only).
   */
  async create(data: CreateSessionInput): Promise<Session> {
    return apiClient.post<Session>('/sessions', data);
  },

  /**
   * Activate a session (admin only).
   * Automatically deactivates all other sessions.
   */
  async activate(id: string): Promise<Session> {
    return apiClient.patch<Session>(`/sessions/${id}/activate`);
  },

  /**
   * Allocate points to users for a session (admin only).
   */
  async allocatePoints(data: AllocatePointsInput): Promise<UserSessionPoints[]> {
    return apiClient.post<UserSessionPoints[]>('/sessions/allocate', data);
  },
};
