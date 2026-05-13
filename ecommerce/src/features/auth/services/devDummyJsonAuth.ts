import type { SignInPayload, SignInResponse } from '@/features/auth/types/auth.types';

/** Response shape from POST https://dummyjson.com/auth/login (DummyJSON uses `accessToken`; older docs used `token`). */
interface DummyJsonAuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

interface DummyJsonErrorBody {
  message?: string;
}

function usernameFromEmailField(emailField: string): string {
  const trimmed = emailField.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0] ?? trimmed;
  }
  return trimmed;
}

/**
 * Dev-only: authenticates against DummyJSON so you can demo without your API.
 * Use DummyJSON `username` in the "Official Email" field (e.g. `emilys`) and
 * matching password (e.g. `emilyspass`). See https://dummyjson.com/docs/auth
 */
export async function signInWithDummyJson(payload: SignInPayload): Promise<SignInResponse> {
  const username = usernameFromEmailField(payload.email);

  const res = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password: payload.password
    })
  });

  const body = (await res.json()) as DummyJsonAuthResponse & DummyJsonErrorBody;

  if (!res.ok) {
    throw new Error(body.message ?? `Login failed (${res.status})`);
  }

  const jwt = body.accessToken ?? body.token;
  if (!jwt) {
    throw new Error(body.message ?? 'Login failed: no token');
  }

  const name = [body.firstName, body.lastName].filter(Boolean).join(' ').trim() || body.username;

  return {
    accessToken: jwt,
    refreshToken: body.refreshToken,
    user: {
      id: String(body.id),
      email: body.email,
      name
    }
  };
}
