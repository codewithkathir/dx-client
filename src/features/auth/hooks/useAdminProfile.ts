'use client';

import { useQuery } from '@tanstack/react-query';

import { adminAuthService } from '@/features/auth/services/admin-auth.service';
import { queryKeys } from '@/lib/query-keys';
import { selectIsAuthenticated } from '@/store/auth/auth.selectors';
import { useAppSelector } from '@/store/hooks';

export function useAdminProfile() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.adminProfile,
    queryFn: () => adminAuthService.getProfile(),
    enabled: isAuthenticated,
  });
}
