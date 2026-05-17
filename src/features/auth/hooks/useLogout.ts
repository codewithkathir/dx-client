'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { clearAllTokens } from '@/features/auth/utils/auth.utils';
import { clearSessionCookies } from '@/features/auth/utils/session.utils';
import { getStoredToken } from '@/services/interceptors';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import { clearAuthSession } from '@/store/auth/auth.slice';
import { useAppDispatch } from '@/store/hooks';

export function useLogout(portal: AuthPortal) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getStoredToken(
        portal === AUTH_PORTAL.ADMIN ? 'ADMIN_REFRESH_TOKEN' : 'USER_REFRESH_TOKEN',
      );
      if (!refreshToken) return;
      if (portal === AUTH_PORTAL.ADMIN) {
        return adminAuthService.logout(refreshToken);
      }
      return employeeAuthService.logout(refreshToken);
    },
    onSettled: () => {
      clearAllTokens();
      clearSessionCookies();
      dispatch(clearAuthSession());
      toast.success(SUCCESS_MESSAGES.LOGOUT);
      router.push(portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN);
    },
  });
}
