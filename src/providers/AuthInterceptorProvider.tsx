'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { clearAllTokens, persistTokens } from '@/features/auth/utils/auth.utils';
import { clearSessionCookies } from '@/features/auth/utils/session.utils';
import { ERROR_MESSAGES } from '@/messages/error.messages';
import { configureAuthInterceptors, getStoredToken } from '@/services/interceptors';
import { toast } from 'sonner';
import { clearAuthSession } from '@/store/auth/auth.slice';
import { selectAuthPortal } from '@/store/auth/auth.selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface AuthInterceptorProviderProps {
  children: React.ReactNode;
}

export function AuthInterceptorProvider({ children }: AuthInterceptorProviderProps) {
  const dispatch = useAppDispatch();
  const portal = useAppSelector(selectAuthPortal);
  const router = useRouter();

  useEffect(() => {
    configureAuthInterceptors({
      getAccessToken: () => {
        if (portal === AUTH_PORTAL.ADMIN) {
          return getStoredToken('ADMIN_ACCESS_TOKEN');
        }
        if (portal === AUTH_PORTAL.USER) {
          return getStoredToken('USER_ACCESS_TOKEN');
        }
        return (
          getStoredToken('ADMIN_ACCESS_TOKEN') ?? getStoredToken('USER_ACCESS_TOKEN')
        );
      },
      refreshSession: async () => {
        if (portal === AUTH_PORTAL.ADMIN) {
          const adminRefresh = getStoredToken('ADMIN_REFRESH_TOKEN');
          if (adminRefresh) {
            try {
              const tokens = await adminAuthService.refreshToken({ refreshToken: adminRefresh });
              persistTokens(AUTH_PORTAL.ADMIN, tokens);
              return tokens.accessToken;
            } catch {
              return null;
            }
          }
        }

        if (portal === AUTH_PORTAL.USER || !portal) {
          const employeeRefresh = getStoredToken('USER_REFRESH_TOKEN');
          if (employeeRefresh) {
            try {
              const tokens = await employeeAuthService.refreshToken({
                refreshToken: employeeRefresh,
              });
              persistTokens(AUTH_PORTAL.USER, tokens);
              return tokens.accessToken;
            } catch {
              return null;
            }
          }
        }

        return null;
      },
      handleUnauthorized: () => {
        clearAllTokens();
        clearSessionCookies();
        dispatch(clearAuthSession());
        toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        const loginPath =
          portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN;
        router.replace(loginPath);
      },
    });
  }, [dispatch, portal, router]);

  return <>{children}</>;
}
