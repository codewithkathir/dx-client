'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { useApiError } from '@/hooks/useApiError';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { ForgotPasswordFormValues } from '@/features/auth/schemas/forgot-password.schema';

export function useForgotPassword(portal: AuthPortal) {
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => {
      if (portal === AUTH_PORTAL.ADMIN) {
        return adminAuthService.forgotPassword(values);
      }
      return employeeAuthService.forgotPassword(values);
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.FORGOT_PASSWORD);
    },
    onError: (err) => handleError(err),
  });
}
