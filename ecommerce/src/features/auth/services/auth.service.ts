import { axiosInstance } from '@/shared/api/axios';
import type { SignInPayload, SignInResponse } from '@/features/auth/types/auth.types';

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const { data } = await axiosInstance.post<SignInResponse>('/auth/login', payload);
  return data;
}
