'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/change-password.schema';

interface ChangePasswordFormProps {
  portal?: AuthPortal;
}

export function ChangePasswordForm({ portal = AUTH_PORTAL.ADMIN }: ChangePasswordFormProps) {
  const { register, handleSubmit, formState, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const mutation = useChangePassword(portal);

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => reset(),
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="Current password"
        htmlFor="oldPassword"
        required
        error={formState.errors.oldPassword?.message}
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="oldPassword"
            type="password"
            autoComplete="current-password"
            className="pl-9"
            {...register('oldPassword')}
          />
        </div>
      </FormField>

      <FormField
        label="New password"
        htmlFor="newPassword"
        required
        error={formState.errors.newPassword?.message}
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="pl-9"
            {...register('newPassword')}
          />
        </div>
      </FormField>

      <FormField
        label="Confirm new password"
        htmlFor="confirmPassword"
        required
        error={formState.errors.confirmPassword?.message}
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="pl-9"
            {...register('confirmPassword')}
          />
        </div>
      </FormField>

      <Button type="submit" disabled={mutation.isPending}>
        Update password
      </Button>
    </form>
  );
}
