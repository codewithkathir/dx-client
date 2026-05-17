'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import {
  clearAllTokens,
  hasPortalSession,
} from '@/features/auth/utils/auth.utils';
import { clearSessionCookies } from '@/features/auth/utils/session.utils';
import { clearAuthSession } from '@/store/auth/auth.slice';
import { setAuthLoading } from '@/store/loading/loading.slice';
import { useAppDispatch } from '@/store/hooks';

interface AuthGuardProps {
  portal: AuthPortal;
  children: React.ReactNode;
}

export function AuthGuard({ portal, children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [allowed, setAllowed] = useState(false);

  const loginPath =
    portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN;

  useLayoutEffect(() => {
    let cancelled = false;

    async function verify() {
      dispatch(setAuthLoading(true));

      if (!hasPortalSession(portal)) {
        clearAllTokens();
        clearSessionCookies();
        dispatch(clearAuthSession());
        dispatch(setAuthLoading(false));
        router.replace(loginPath);
        return;
      }

      try {
        if (portal === AUTH_PORTAL.ADMIN) {
          await adminAuthService.getProfile();
        } else {
          await employeeAuthService.getProfile();
        }
        if (!cancelled) {
          setAllowed(true);
        }
      } catch {
        if (cancelled) return;
        clearAllTokens();
        clearSessionCookies();
        dispatch(clearAuthSession());
        router.replace(loginPath);
      } finally {
        if (!cancelled) {
          dispatch(setAuthLoading(false));
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
      dispatch(setAuthLoading(false));
    };
  }, [dispatch, loginPath, portal, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
