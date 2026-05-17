import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  EmployeeAuthResponse,
  EmployeeChangePasswordPayload,
  EmployeeForgotPasswordPayload,
  EmployeeLoginPayload,
  EmployeeProfile,
  EmployeeRefreshPayload,
  EmployeeResetPasswordPayload,
} from '@/types/employee-auth.types';
import type { AuthTokens } from '@/types/auth.types';

class EmployeeAuthService extends BaseService {
  login(payload: EmployeeLoginPayload): Promise<EmployeeAuthResponse> {
    return this.post<EmployeeAuthResponse>(API_ENDPOINTS.AUTH.EMPLOYEE_LOGIN, payload);
  }

  logout(refreshToken: string): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.EMPLOYEE_LOGOUT, { refreshToken });
  }

  refreshToken(payload: EmployeeRefreshPayload): Promise<AuthTokens> {
    return this.post<AuthTokens>(API_ENDPOINTS.AUTH.EMPLOYEE_REFRESH, payload);
  }

  getProfile(): Promise<EmployeeProfile> {
    return this.get<EmployeeProfile>(API_ENDPOINTS.AUTH.EMPLOYEE_ME);
  }

  forgotPassword(payload: EmployeeForgotPasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.EMPLOYEE_FORGOT_PASSWORD, payload);
  }

  resetPassword(payload: EmployeeResetPasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.EMPLOYEE_RESET_PASSWORD, payload);
  }

  changePassword(payload: EmployeeChangePasswordPayload): Promise<void> {
    return this.post<void>(API_ENDPOINTS.AUTH.EMPLOYEE_CHANGE_PASSWORD, payload);
  }

  uploadProfilePhoto(file: File): Promise<EmployeeProfile> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return this.post<EmployeeProfile>(API_ENDPOINTS.AUTH.EMPLOYEE_PROFILE_PHOTO, formData);
  }
}

export const employeeAuthService = new EmployeeAuthService();
