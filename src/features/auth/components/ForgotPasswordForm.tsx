'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

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

  if (mutation.isSuccess) {
    return (
      <div className="space-y-6 rounded-lg border border-border bg-muted/30 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, you will receive password reset instructions shortly.
        </p>
        <Link
          href={loginHref}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {literals.BACK_TO_LOGIN}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormField label={literals.EMAIL_LABEL} htmlFor="email" required error={formState.errors.email?.message}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" autoComplete="email" className="pl-9" {...register('email')} />
        </div>
      </FormField>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {literals.SUBMIT_FORGOT}
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
