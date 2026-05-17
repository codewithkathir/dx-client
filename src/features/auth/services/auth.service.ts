import type { AuthPortal } from '@/constants/auth.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  AuthApiResponse,
  AuthSession,
  AuthTokens,
  AuthUser,
  LoginPayload,
} from '@/types/auth.types';

class AuthService extends BaseService {
  private mapSession(portal: AuthPortal, data: AuthApiResponse): AuthSession {
    return {
      portal,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
      user: {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        permissions: [],
      },
    };
  }

  login(portal: AuthPortal, payload: LoginPayload): Promise<AuthSession> {
    const endpoint =
      portal === 'admin' ? API_ENDPOINTS.AUTH.ADMIN_LOGIN : API_ENDPOINTS.AUTH.LOGIN;

    if (portal === 'admin') {
      return this.post<{
        accessToken: string;
        refreshToken: string;
        admin: AuthApiResponse['user'];
      }>(endpoint, payload).then((data) =>
        this.mapSession(portal, {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.admin,
        }),
      );
    }

    return this.post<AuthApiResponse>(endpoint, payload).then((data) =>
      this.mapSession(portal, data),
    );
  }

  logout(portal: AuthPortal, refreshToken?: string | null): Promise<void> {
    if (!refreshToken) {
      return Promise.resolve();
    }
    const endpoint =
      portal === 'admin' ? API_ENDPOINTS.AUTH.ADMIN_LOGOUT : API_ENDPOINTS.AUTH.LOGOUT;
    return this.post<void>(endpoint, { refreshToken }).catch(() => undefined);
  }

  refreshToken(portal: AuthPortal, refreshToken: string): Promise<AuthTokens> {
    const endpoint =
      portal === 'admin' ? API_ENDPOINTS.AUTH.ADMIN_REFRESH : API_ENDPOINTS.AUTH.REFRESH;
    return this.post<Pick<AuthApiResponse, 'accessToken' | 'refreshToken'>>(endpoint, {
      refreshToken,
    }).then((data) => ({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }));
  }

  getProfile(portal: AuthPortal): Promise<AuthUser> {
    const endpoint = portal === 'admin' ? API_ENDPOINTS.AUTH.ADMIN_ME : API_ENDPOINTS.AUTH.ME;
    return this.get<AuthApiResponse['user']>(endpoint).then((user) => ({
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: [],
    }));
  }

  forgotPassword(portal: AuthPortal, email: string): Promise<void> {
    if (portal === 'admin') {
      return adminAuthService.forgotPassword({ email });
    }
    return Promise.reject(new Error('User forgot password not implemented'));
  }

  resetPassword(portal: AuthPortal, token: string, newPassword: string): Promise<void> {
    if (portal === 'admin') {
      return adminAuthService.resetPassword({ token, newPassword });
    }
    return Promise.reject(new Error('User reset password not implemented'));
  }
}

export const authService = new AuthService();
