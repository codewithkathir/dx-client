'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import type { ResetPasswordFormValues } from '@/features/auth/schemas/reset-password.schema';
import { useApiError } from '@/hooks/useApiError';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';

export function useResetPassword(portal: AuthPortal) {
  const router = useRouter();
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) => {
      if (portal !== AUTH_PORTAL.ADMIN) {
        return Promise.reject(new Error('User reset password not implemented'));
      }
      return adminAuthService.resetPassword({
        token: values.token,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.RESET_PASSWORD);
      router.push(portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN);
    },
    onError: (err) => handleError(err),
  });
}
