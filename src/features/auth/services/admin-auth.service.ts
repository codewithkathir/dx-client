import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  AdminAuthResponse,
  AdminChangePasswordPayload,
  AdminForgotPasswordPayload,
  AdminLoginPayload,
  AdminProfile,
  AdminRefreshPayload,
  AdminResetPasswordPayload,
} from '@/types/admin-auth.types';
import type { AuthTokens } from '@/types/auth.types';

class AdminAuthService extends BaseService {
  login(payload: AdminLoginPayload): Promise<AdminAuthResponse> {
    return this.post<AdminAuthResponse>(API_ENDPOINTS.AUTH.ADMIN_LOGIN, payload);
  }

  logout(refreshToken: string): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.ADMIN_LOGOUT, { refreshToken });
  }

  refreshToken(payload: AdminRefreshPayload): Promise<AuthTokens> {
    return this.post<AuthTokens>(API_ENDPOINTS.AUTH.ADMIN_REFRESH, payload);
  }

  getProfile(): Promise<AdminProfile> {
    return this.get<AdminProfile>(API_ENDPOINTS.AUTH.ADMIN_ME);
  }

  forgotPassword(payload: AdminForgotPasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.ADMIN_FORGOT_PASSWORD, payload);
  }

  resetPassword(payload: AdminResetPasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.ADMIN_RESET_PASSWORD, payload);
  }

  changePassword(payload: AdminChangePasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.ADMIN_CHANGE_PASSWORD, payload);
  }

  uploadProfilePhoto(file: File): Promise<AdminProfile> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return this.post<AdminProfile>(API_ENDPOINTS.AUTH.ADMIN_PROFILE_PHOTO, formData);
  }
}

export const adminAuthService = new AdminAuthService();
