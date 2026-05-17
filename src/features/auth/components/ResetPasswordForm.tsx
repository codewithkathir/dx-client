'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password.schema';

interface ResetPasswordFormProps {
  portal: AuthPortal;
}

export function ResetPasswordForm({ portal }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const literals = portal === AUTH_PORTAL.ADMIN ? AUTH_LITERALS.ADMIN : AUTH_LITERALS.USER;
  const loginHref = portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN;

  const { register, handleSubmit, formState, setValue } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const mutation = useResetPassword(portal);

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {!tokenFromUrl ? (
        <FormField label="Reset token" htmlFor="token" required error={formState.errors.token?.message}>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="token" className="pl-9" {...register('token')} />
          </div>
        </FormField>
      ) : (
        <input type="hidden" {...register('token')} />
      )}

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
        label="Confirm password"
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

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {literals.SUBMIT_RESET}
      </Button>

      <Link
        href={loginHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {literals.BACK_TO_LOGIN}
      </Link>
    </form>
  );
}
