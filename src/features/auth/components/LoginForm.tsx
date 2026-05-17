'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
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

  const onSubmit = handleSubmit(
    (values) => {
      loginMutation.mutate(values);
    },
    () => {
      toast.error('Please enter a valid email and password');
    },
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormField
        label={literals.EMAIL_LABEL}
        htmlFor="email"
        required
        error={errors.email?.message}
      >
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="pl-9"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </div>
      </FormField>

      <FormField
        label={literals.PASSWORD_LABEL}
        htmlFor="password"
        required
        error={errors.password?.message}
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="pl-9"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </div>
      </FormField>

      <div className="flex items-center justify-end">
        <Link href={forgotHref} className="text-sm text-primary hover:underline">
          {literals.FORGOT_LINK}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {literals.SUBMIT_LOGIN}
      </Button>
    </form>
  );
}
