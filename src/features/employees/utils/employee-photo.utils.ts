import { envConfig } from '@/config/env.config';
import { API_ENDPOINTS } from '@/services/endpoints';

export function employeeProfilePhotoUrl(employeeId: number): string {
  const base = envConfig.apiUrl.replace(/\/$/, '');
  const path = API_ENDPOINTS.EMPLOYEES.PROFILE_PHOTO(employeeId);
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
