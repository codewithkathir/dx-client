'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { persistTokens } from '@/features/auth/utils/auth.utils';
import { setSessionCookie } from '@/features/auth/utils/session.utils';
import { useApiError } from '@/hooks/useApiError';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import { clearGlobalError } from '@/store/error/error.slice';
import { setAuthSession } from '@/store/auth/auth.slice';
import { useAppDispatch } from '@/store/hooks';
import type { LoginPayload } from '@/types/auth.types';

export function useLogin(portal: AuthPortal) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      if (portal === AUTH_PORTAL.ADMIN) {
        const data = await adminAuthService.login(payload);
        return {
          user: {
            id: String(data.admin.id),
            email: data.admin.email,
            name: data.admin.name,
            role: data.admin.role,
            permissions: [] as string[],
          },
          tokens: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
          portal,
        };
      }

      const data = await employeeAuthService.login(payload);
      return {
        user: {
          id: String(data.employee.id),
          email: data.employee.email,
          name: data.employee.empName,
          role: data.employee.role,
          permissions: [] as string[],
        },
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        portal,
      };
    },
    onSuccess: (session) => {
      persistTokens(portal, session.tokens);
      setSessionCookie(portal);
      dispatch(setAuthSession({ user: session.user, portal }));
      dispatch(clearGlobalError());
      toast.success(SUCCESS_MESSAGES.LOGIN);

      const redirect =
        portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.DASHBOARD : USER_ROUTES.HOME;
      router.push(redirect);
    },
    onError: (err) => handleError(err),
  });
}
