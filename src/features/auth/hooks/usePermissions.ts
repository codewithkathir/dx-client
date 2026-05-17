'use client';

import { selectUserPermissions } from '@/store/auth/auth.selectors';
import { useAppSelector } from '@/store/hooks';

export function usePermissions() {
  const permissions = useAppSelector(selectUserPermissions);

  const hasPermission = (permission: string): boolean => permissions.includes(permission);

  const hasAnyPermission = (required: string[]): boolean =>
    required.some((permission) => permissions.includes(permission));

  const hasAllPermissions = (required: string[]): boolean =>
    required.every((permission) => permissions.includes(permission));

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
