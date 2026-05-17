import { envConfig } from '@/config/env.config';
import { API_ENDPOINTS } from '@/services/endpoints';

function buildUrl(path: string): string {
  const base = envConfig.apiUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function adminProfilePhotoUrl(): string {
  return buildUrl(API_ENDPOINTS.AUTH.ADMIN_PROFILE_PHOTO);
}

export function employeeSelfProfilePhotoUrl(): string {
  return buildUrl(API_ENDPOINTS.AUTH.EMPLOYEE_PROFILE_PHOTO);
}
