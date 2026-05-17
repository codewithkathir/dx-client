'use client';

import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type { AuthPortal } from '@/constants/auth.constants';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

interface ResetPasswordFormWrapperProps {
  portal: AuthPortal;
}

export function ResetPasswordFormWrapper({ portal }: ResetPasswordFormWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <ResetPasswordForm portal={portal} />
    </Suspense>
  );
}
