import type { AuthState } from '@/store/auth/auth.types';

export const initialAuthState: AuthState = {
  user: null,
  portal: null,
  isAuthenticated: false,
  isLoading: false,
};
