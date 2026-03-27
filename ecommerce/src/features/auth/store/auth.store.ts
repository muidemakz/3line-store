import { create } from 'zustand';
import type { SignInResponse } from '@/features/auth/types/auth.types';

interface AuthStoreState {
  rememberMe: boolean;
  isPasswordVisible: boolean;
  session: SignInResponse | null;
  setRememberMe: (rememberMe: boolean) => void;
  setPasswordVisible: (isPasswordVisible: boolean) => void;
  setSession: (session: SignInResponse) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  rememberMe: true,
  isPasswordVisible: false,
  session: null,
  setRememberMe: (rememberMe) => set({ rememberMe }),
  setPasswordVisible: (isPasswordVisible) => set({ isPasswordVisible }),
  setSession: (session) => set({ session })
}));
