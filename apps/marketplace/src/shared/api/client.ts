const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Token management ───────────────────────────────────────────
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccess: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token: string): void => localStorage.setItem(REFRESH_KEY, token),
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Standard API response shapes ───────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ── Core fetch wrapper ─────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.getAccess();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  if (!response.ok) {
    // Attempt token refresh on 401
    if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        return request<T>(path, options);
      }
    }

    const errorMessage = json?.message || `Request failed (${response.status})`;
    const error = new Error(errorMessage) as Error & { errors?: Record<string, string[]> };
    error.errors = json?.errors;
    throw error;
  }

  return json.data as T;
}

// ── Token refresh ──────────────────────────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clear();
      return false;
    }

    const json = await response.json();
    tokenStorage.setAccess(json.data.accessToken);
    tokenStorage.setRefresh(json.data.refreshToken);
    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

// ── Public API client ──────────────────────────────────────────
export const apiClient = {
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  // Called from AppContext after login
  setToken: (accessToken: string, refreshToken?: string) => {
    tokenStorage.setAccess(accessToken);
    if (refreshToken) tokenStorage.setRefresh(refreshToken);
  },

  clearToken: () => tokenStorage.clear(),
};
