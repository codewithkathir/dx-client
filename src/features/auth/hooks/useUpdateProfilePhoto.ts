'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';

export function useUpdateProfilePhoto(portal: AuthPortal) {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: async (file: File) => {
      if (portal === AUTH_PORTAL.ADMIN) {
        await adminAuthService.uploadProfilePhoto(file);
        return;
      }
      await employeeAuthService.uploadProfilePhoto(file);
    },
    onSuccess: () => {
      if (portal === AUTH_PORTAL.ADMIN) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.adminProfile });
      } else {
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.employeeProfile });
      }
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });
}
