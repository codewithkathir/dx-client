'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import type { ChangePasswordFormValues } from '@/features/auth/schemas/change-password.schema';
import { useApiError } from '@/hooks/useApiError';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import { clearAllTokens, persistTokens } from '@/features/auth/utils/auth.utils';
import { getStoredToken } from '@/services/interceptors';

export function useChangePassword(portal: AuthPortal) {
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) => {
      const payload = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
      if (portal === AUTH_PORTAL.ADMIN) {
        return adminAuthService.changePassword(payload);
      }
      return employeeAuthService.changePassword(payload);
    },
    onSuccess: async () => {
      toast.success(SUCCESS_MESSAGES.CHANGE_PASSWORD);
      const refreshKey =
        portal === AUTH_PORTAL.ADMIN ? 'ADMIN_REFRESH_TOKEN' : 'USER_REFRESH_TOKEN';
      const refreshToken = getStoredToken(refreshKey);
      if (refreshToken) {
        try {
          const tokens =
            portal === AUTH_PORTAL.ADMIN
              ? await adminAuthService.refreshToken({ refreshToken })
              : await employeeAuthService.refreshToken({ refreshToken });
          persistTokens(portal, tokens);
        } catch {
          clearAllTokens();
        }
      }
    },
    onError: (err) => handleError(err),
  });
}
