import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { signIn } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { SignInPayload, SignInResponse } from '@/features/auth/types/auth.types';
import { notifySuccess } from '@/shared/lib/toast';

interface AuthErrorResponse {
  message?: string;
}

export function useSignInMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<SignInResponse, AxiosError<AuthErrorResponse>, SignInPayload>({
    mutationFn: signIn,
    onSuccess: (data) => {
      setSession(data);
      localStorage.setItem('auth_token', data.accessToken);
      notifySuccess('Signed in successfully');
    }
  });
}
