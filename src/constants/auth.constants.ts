export const AUTH_STORAGE_KEYS = {
  ADMIN_ACCESS_TOKEN: 'dx_admin_access_token',
  ADMIN_REFRESH_TOKEN: 'dx_admin_refresh_token',
  USER_ACCESS_TOKEN: 'dx_user_access_token',
  USER_REFRESH_TOKEN: 'dx_user_refresh_token',
} as const;

export const AUTH_COOKIE_NAMES = {
  ADMIN_SESSION: 'dx_admin_session',
  USER_SESSION: 'dx_user_session',
} as const;

export const AUTH_PORTAL = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type AuthPortal = (typeof AUTH_PORTAL)[keyof typeof AUTH_PORTAL];
