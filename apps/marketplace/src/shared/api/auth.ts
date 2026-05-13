import { apiClient, tokenStorage } from './client';

// ── Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ── Service ────────────────────────────────────────────────────
export const authService = {
  /**
   * Login with email and password.
   * Stores tokens in localStorage automatically.
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/login', data);
    tokenStorage.setAccess(result.tokens.accessToken);
    tokenStorage.setRefresh(result.tokens.refreshToken);
    return result;
  },

  /**
   * Register a new user account.
   * Stores tokens in localStorage automatically.
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/register', data);
    tokenStorage.setAccess(result.tokens.accessToken);
    tokenStorage.setRefresh(result.tokens.refreshToken);
    return result;
  },

  /**
   * Get the currently authenticated user's profile.
   * Throws if the token is invalid or expired.
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Logout — invalidates the refresh token on the server
   * and clears tokens from localStorage.
   */
  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } finally {
      tokenStorage.clear();
    }
  },

  /**
   * Logout from all devices.
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } finally {
      tokenStorage.clear();
    }
  },

  /**
   * Request a password reset email.
   */
  async forgotPassword(email: string): Promise<{ message: string; resetUrl?: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Check if the user is currently authenticated
   * (token exists in localStorage).
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.getAccess();
  },
};
