export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';
export type AdminStatus = 'active' | 'inactive';

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  profilePhoto: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields an admin can change on their own profile. */
export interface UpdateAdminProfilePayload {
  name: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminForgotPasswordPayload {
  email: string;
}

export interface AdminResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AdminChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface AdminRefreshPayload {
  refreshToken: string;
}
