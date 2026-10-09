'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { CircleCheck } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password.schema';

interface ForgotPasswordFormProps {
  portal: AuthPortal;
}

export function ForgotPasswordForm({ portal }: ForgotPasswordFormProps) {
  const literals = portal === AUTH_PORTAL.ADMIN ? AUTH_LITERALS.ADMIN : AUTH_LITERALS.USER;
  const loginHref = portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.LOGIN : USER_ROUTES.LOGIN;

  const { register, handleSubmit, formState } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const mutation = useForgotPassword(portal);

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const isUser = portal === AUTH_PORTAL.USER;

  return (
    <form onSubmit={onSubmit} className={isUser ? 'flex flex-1 flex-col gap-5' : 'flex flex-col gap-5'} noValidate>
      <FormField label={literals.EMAIL_LABEL} htmlFor="email" required error={formState.errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className={isUser ? 'h-[52px] rounded-[14px] text-base' : 'h-11'}
          {...register('email')}
        />
      </FormField>

      {mutation.isSuccess ? (
        <div
          role="status"
          className="flex animate-in gap-3 rounded-xl bg-status-success px-4 py-3.5 text-sm text-status-success-ink fade-in-0 slide-in-from-top-1 duration-300"
        >
          <CircleCheck className="mt-px size-5 shrink-0" aria-hidden />
          <p>
            <strong className="font-semibold">Check your inbox.</strong> If an account exists for that email, a reset link
            is on its way.
          </p>
        </div>
      ) : null}

      <Button
        loading={mutation.isPending}
        type="submit"
        className={isUser ? 'mt-auto h-[52px] w-full rounded-[14px] text-base font-semibold' : 'h-11 w-full text-[15px]'}
      >
        {literals.SUBMIT_FORGOT}
      </Button>
      {isUser ? (
        <Link href={loginHref} className="p-2.5 text-center text-[15px] font-medium text-primary">
          {literals.BACK_TO_LOGIN}
        </Link>
      ) : null}
    </form>
  );
}
