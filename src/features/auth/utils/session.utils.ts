import { AUTH_COOKIE_NAMES, AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';

export function setSessionCookie(portal: AuthPortal): void {
  if (typeof document === 'undefined') return;
  const cookieName =
    portal === AUTH_PORTAL.ADMIN ? AUTH_COOKIE_NAMES.ADMIN_SESSION : AUTH_COOKIE_NAMES.USER_SESSION;
  document.cookie = `${cookieName}=1; path=/; SameSite=Lax`;
}

export function clearSessionCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAMES.ADMIN_SESSION}=; path=/; max-age=0`;
  document.cookie = `${AUTH_COOKIE_NAMES.USER_SESSION}=; path=/; max-age=0`;
}
