'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';
import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { employeeAuthService } from '@/features/auth/services/employee-auth.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { UpdateAdminProfilePayload } from '@/types/admin-auth.types';
import type { UpdateEmployeeProfilePayload } from '@/types/employee-auth.types';

export type UpdateProfileInput =
  | { portal: typeof AUTH_PORTAL.ADMIN; fields: UpdateAdminProfilePayload; photo: File | null }
  | { portal: typeof AUTH_PORTAL.USER; fields: UpdateEmployeeProfilePayload; photo: File | null };

/** Saves profile fields and, when a new photo was picked, uploads it first. */
export function useUpdateProfile(portal: AuthPortal) {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (input.portal === AUTH_PORTAL.ADMIN) {
        if (input.photo) await adminAuthService.uploadProfilePhoto(input.photo);
        return adminAuthService.updateProfile(input.fields);
      }
      if (input.photo) await employeeAuthService.uploadProfilePhoto(input.photo);
      return employeeAuthService.updateProfile(input.fields);
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
    },
    onError: (err) => handleError(err),
    // Refetch even on failure: the photo may have uploaded before the fields failed.
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey:
          portal === AUTH_PORTAL.ADMIN
            ? queryKeys.auth.adminProfile
            : queryKeys.auth.employeeProfile,
      });
    },
  });
}
