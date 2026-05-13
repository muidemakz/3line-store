import { axiosInstance } from '@/shared/api/axios';
import { isDevAuthMockEnabled } from '@/shared/lib/devAuthMock';
import { signInWithDummyJson } from '@/features/auth/services/devDummyJsonAuth';
import type { SignInPayload, SignInResponse } from '@/features/auth/types/auth.types';

/**
 * Production / staging: POST `{baseURL}/auth/login` (same contract as admin portal).
 * Development: if `isDevAuthMockEnabled()`, uses DummyJSON — see `devAuthMock.ts`.
 */
export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  if (isDevAuthMockEnabled()) {
    return signInWithDummyJson(payload);
  }

  const { data } = await axiosInstance.post<SignInResponse>('/auth/login', payload);
  return data;
}
