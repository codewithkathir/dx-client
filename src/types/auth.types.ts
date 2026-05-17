import type { AuthPortal } from '@/constants/auth.constants';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  portal: AuthPortal;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Backend login/register response shape */
export interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status?: string;
    emailVerified?: boolean;
  };
}
