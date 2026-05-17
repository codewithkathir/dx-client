import type { AuthPortal } from '@/constants/auth.constants';
import type { AuthUser } from '@/types/auth.types';

export interface AuthState {
  user: AuthUser | null;
  portal: AuthPortal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
