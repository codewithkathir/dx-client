import {
  AUTH_COOKIE_NAMES,
  AUTH_PORTAL,
  AUTH_STORAGE_KEYS,
  type AuthPortal,
} from '@/constants/auth.constants';
import type { AuthTokens } from '@/types/auth.types';

export function getTokenStorageKeys(portal: AuthPortal) {
  return portal === AUTH_PORTAL.ADMIN
    ? {
        access: AUTH_STORAGE_KEYS.ADMIN_ACCESS_TOKEN,
        refresh: AUTH_STORAGE_KEYS.ADMIN_REFRESH_TOKEN,
      }
    : {
        access: AUTH_STORAGE_KEYS.USER_ACCESS_TOKEN,
        refresh: AUTH_STORAGE_KEYS.USER_REFRESH_TOKEN,
      };
}

export function persistTokens(portal: AuthPortal, tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  const keys = getTokenStorageKeys(portal);
  localStorage.setItem(keys.access, tokens.accessToken);
  localStorage.setItem(keys.refresh, tokens.refreshToken);
}

export function clearTokens(portal: AuthPortal): void {
  if (typeof window === 'undefined') return;
  const keys = getTokenStorageKeys(portal);
  localStorage.removeItem(keys.access);
  localStorage.removeItem(keys.refresh);
}

export function clearAllTokens(): void {
  clearTokens(AUTH_PORTAL.ADMIN);
  clearTokens(AUTH_PORTAL.USER);
}

function hasSessionCookie(portal: AuthPortal): boolean {
  if (typeof document === 'undefined') return false;
  const cookieName =
    portal === AUTH_PORTAL.ADMIN
      ? AUTH_COOKIE_NAMES.ADMIN_SESSION
      : AUTH_COOKIE_NAMES.USER_SESSION;
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${cookieName}=`));
}

export function hasPortalSession(portal: AuthPortal): boolean {
  if (typeof window === 'undefined') return false;
  const keys = getTokenStorageKeys(portal);
  const token = localStorage.getItem(keys.access);
  return Boolean(token?.trim()) && hasSessionCookie(portal);
}
