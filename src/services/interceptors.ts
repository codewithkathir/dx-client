import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { AUTH_STORAGE_KEYS } from '@/constants/auth.constants';
import { normalizeApiError } from '@/utils/errors/error.utils';

type TokenResolver = () => string | null;
type RefreshSession = () => Promise<string | null>;

let accessTokenResolver: TokenResolver = () => null;
let refreshSession: RefreshSession | null = null;
let onUnauthorized: (() => void) | null = null;

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Auth routes where 401 is an expected validation response (e.g. wrong password). */
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/admin/login',
  '/auth/admin/logout',
  '/auth/admin/forgot-password',
  '/auth/admin/reset-password',
  '/auth/admin/refresh-token',
  '/auth/employee/login',
  '/auth/employee/logout',
  '/auth/employee/forgot-password',
  '/auth/employee/reset-password',
  '/auth/employee/refresh-token',
] as const;

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function requestHadBearerToken(config?: InternalAxiosRequestConfig): boolean {
  const auth = config?.headers?.Authorization;
  if (typeof auth === 'string') {
    return auth.startsWith('Bearer ');
  }
  return false;
}

function shouldForceLogout(
  statusCode: number,
  config?: InternalAxiosRequestConfig,
): boolean {
  if (statusCode !== 401) return false;
  if (isPublicAuthRequest(config?.url)) return false;
  return requestHadBearerToken(config);
}

function processRefreshQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
}

export function configureAuthInterceptors(options: {
  getAccessToken: TokenResolver;
  refreshSession?: RefreshSession;
  handleUnauthorized: () => void;
}): void {
  accessTokenResolver = options.getAccessToken;
  refreshSession = options.refreshSession ?? null;
  onUnauthorized = options.handleUnauthorized;
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    if (isPublicAuthRequest(config.url)) {
      return config;
    }
    const token = accessTokenResolver();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const normalized = normalizeApiError(error);
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        normalized.statusCode === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isPublicAuthRequest(originalRequest.url) &&
        refreshSession &&
        requestHadBearerToken(originalRequest)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({
              resolve: (token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(client(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshSession();
          if (!newToken) {
            throw new Error('Refresh failed');
          }
          processRefreshQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          processRefreshQueue(refreshError, null);
          if (shouldForceLogout(401, originalRequest)) {
            onUnauthorized?.();
          }
          return Promise.reject(normalized);
        } finally {
          isRefreshing = false;
        }
      }

      if (shouldForceLogout(normalized.statusCode, originalRequest)) {
        onUnauthorized?.();
      }

      return Promise.reject(normalized);
    },
  );
}

export function getStoredToken(key: keyof typeof AUTH_STORAGE_KEYS): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS[key]);
}
