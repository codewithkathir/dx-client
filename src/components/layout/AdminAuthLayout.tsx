import Link from 'next/link';
import { ArrowLeft, Shield, type LucideIcon } from 'lucide-react';

import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { cn } from '@/lib/utils';

interface AdminAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  /** Big line on the blue panel. */
  headline?: string;
  /** Smaller line under the headline (sign-in page). */
  tagline?: string;
  /** "Admin portal" pill under the title (sign-in page). */
  showPortalBadge?: boolean;
  /** Icon tile above the title (forgot password). */
  icon?: LucideIcon;
  /** Shows "Back to sign in" above the form. */
  showBackLink?: boolean;
}

/** Design "Login" / "ForgotPassword" / "ResetPassword": brand-blue story panel, the form on white. */
export function AdminAuthLayout({
  children,
  title,
  subtitle,
  className,
  headline = 'Money in, money out — every record in its place.',
  tagline,
  showPortalBadge = false,
  icon: Icon,
  showBackLink = false,
}: AdminAuthLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-wrap bg-card text-foreground">
      <section
        aria-label="About DX Enterprise"
        className="relative flex flex-[1_1_420px] flex-col justify-between gap-12 overflow-hidden bg-primary p-8 text-white max-lg:hidden sm:p-12"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
        <img src="/brand/dx-lockup-reversed.svg" alt="DX Enterprise" className="relative h-10 w-auto self-start" />
        <div aria-hidden className="absolute -right-[60px] top-[120px] size-[420px] opacity-90">
          <div className="absolute left-[60px] top-0 h-[420px] w-[120px] origin-top-left -skew-x-[32deg] bg-white/8" />
          <div className="absolute left-[140px] top-0 h-[420px] w-[120px] origin-top-left skew-x-[32deg] rounded bg-brand-green" />
        </div>
        <div className="relative flex max-w-[460px] flex-col gap-4 page-in">
          <h1 className="text-[40px] leading-[46px] font-semibold tracking-[-0.025em]">{headline}</h1>
          {tagline ? <p className="text-base leading-6 text-[#dbe5fd]">{tagline}</p> : null}
        </div>
        <p className="relative text-[13px] text-[#c9d6f7]">© {year} DX Enterprise</p>
      </section>

      <section
        aria-labelledby="auth-title"
        className={cn('flex flex-[1_1_480px] items-center justify-center px-6 py-12', className)}
      >
        <div className="page-in flex w-full max-w-[400px] flex-col gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
          <img src="/brand/dx-lockup.svg" alt="DX Enterprise" className="h-9 w-auto self-start lg:hidden" />
          {showBackLink ? (
            <Link
              href={ADMIN_ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to sign in
            </Link>
          ) : null}
          {Icon ? (
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-blue-50 text-primary" aria-hidden>
              <Icon className="size-6" />
            </span>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <h2 id="auth-title" className="text-[28px] leading-9 font-semibold tracking-[-0.025em]">
              {title}
            </h2>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {showPortalBadge ? (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-brand-blue-50 px-2.5 py-1 text-[13px] font-semibold text-brand-blue-hover">
              <Shield className="size-3.5" aria-hidden />
              Admin portal
            </span>
          ) : null}
          {children}
        </div>
      </section>
    </div>
  );
}
