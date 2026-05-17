export type EmployeeAuthStatus = 'active' | 'inactive' | 'suspended';

export interface EmployeeProfile {
  id: number;
  empName: string;
  companyName: string;
  email: string;
  status: EmployeeAuthStatus;
  role: string;
  profilePhoto: string | null;
  phoneNo: string;
  cityState: string;
  country: string;
  dob: string;
  homeAddress: string;
  whatsappNo: string | null;
  lastLoginAt: string | null;
}

export interface EmployeeAuthResponse {
  accessToken: string;
  refreshToken: string;
  employee: EmployeeProfile;
}

export interface EmployeeLoginPayload {
  email: string;
  password: string;
}

export interface EmployeeForgotPasswordPayload {
  email: string;
}

export interface EmployeeResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface EmployeeChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface EmployeeRefreshPayload {
  refreshToken: string;
}
