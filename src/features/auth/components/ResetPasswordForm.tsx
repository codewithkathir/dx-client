'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import { FormField } from '@/components/forms/FormField';
import { PasswordStrength } from '@/components/forms/PasswordStrength';
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

  const { register, handleSubmit, formState, setValue, watch } = useForm<ResetPasswordFormValues>({
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

  const isUser = portal === AUTH_PORTAL.USER;
  const inputClass = isUser ? 'h-[52px] rounded-[14px] text-base' : 'h-11';
  const newPassword = watch('newPassword');

  return (
    <form onSubmit={onSubmit} className={isUser ? 'flex flex-1 flex-col gap-[18px]' : 'flex flex-col gap-5'} noValidate>
      {!tokenFromUrl ? (
        <FormField label="Reset code" htmlFor="token" required error={formState.errors.token?.message}>
          <Input id="token" className={inputClass} {...register('token')} />
        </FormField>
      ) : (
        <input type="hidden" {...register('token')} />
      )}

      <FormField label="New password" htmlFor="newPassword" required error={formState.errors.newPassword?.message}>
        <Input id="newPassword" type="password" autoComplete="new-password" className={inputClass} {...register('newPassword')} />
        <PasswordStrength value={newPassword ?? ''} />
      </FormField>

      <FormField
        label="Confirm new password"
        htmlFor="confirmPassword"
        required
        error={formState.errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register('confirmPassword')}
        />
      </FormField>

      <Button
        loading={mutation.isPending}
        type="submit"
        className={isUser ? 'mt-auto h-[52px] w-full rounded-[14px] text-base font-semibold' : 'h-11 w-full text-[15px]'}
      >
        {literals.SUBMIT_RESET}
      </Button>

      <Link href={loginHref} className="text-center text-sm font-medium text-primary hover:underline">
        {literals.BACK_TO_LOGIN}
      </Link>
    </form>
  );
}
