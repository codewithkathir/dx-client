'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
import { cn } from '@/lib/utils';
import { useLogin } from '@/features/auth/hooks/useLogin';

interface LoginFormProps {
  portal: AuthPortal;
}

export function LoginForm({ portal }: LoginFormProps) {
  const literals = portal === AUTH_PORTAL.ADMIN ? AUTH_LITERALS.ADMIN : AUTH_LITERALS.USER;
  const forgotHref =
    portal === AUTH_PORTAL.ADMIN ? ADMIN_ROUTES.FORGOT_PASSWORD : USER_ROUTES.FORGOT_PASSWORD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useLogin(portal);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = handleSubmit(
    (values) => {
      loginMutation.mutate(values);
    },
    () => {
      toast.error('Please enter a valid email and password');
    },
  );

  const isUser = portal === AUTH_PORTAL.USER;
  const inputClass = isUser ? 'h-[52px] rounded-[14px] px-4 text-base' : 'h-11';

  return (
    <form onSubmit={onSubmit} className={isUser ? 'flex flex-1 flex-col gap-[18px]' : 'flex flex-col gap-5'} noValidate>
      <FormField label={literals.EMAIL_LABEL} htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm leading-none font-medium">
            {literals.PASSWORD_LABEL} <span className="text-destructive">*</span>
          </label>
          <Link
            href={forgotHref}
            className={cn('font-medium text-primary hover:underline', isUser ? 'text-sm' : 'text-[13px]')}
          >
            {literals.FORGOT_LINK}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={cn(inputClass, 'pr-12')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password?.message ? (
          <p id="password-error" className="text-[13px] text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        loading={loginMutation.isPending}
        type="submit"
        className={
          isUser ? 'mt-auto h-[52px] w-full rounded-[14px] text-base font-semibold' : 'mt-1 h-11 w-full text-[15px]'
        }
      >
        {literals.SUBMIT_LOGIN}
      </Button>
      {isUser ? null : (
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Lock className="size-4 shrink-0" aria-hidden />
          Your session is encrypted. Employees sign in on the mobile app.
        </p>
      )}
    </form>
  );
}
