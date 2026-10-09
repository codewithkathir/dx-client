import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/routes.constants';
import { cn } from '@/lib/utils';

interface EmployeeAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  /** "plain" = white screen with a back arrow (forgot / reset password). */
  variant?: 'hero' | 'plain';
  /** Icon tile above the title (plain variant). */
  icon?: LucideIcon;
}

/** Design "MobileLogin": blue hero with the tagline, form on a white sheet below it. */
export function EmployeeAuthLayout({
  children,
  title,
  subtitle,
  className,
  variant = 'hero',
  icon: Icon,
}: EmployeeAuthLayoutProps) {
  if (variant === 'plain') {
    return (
      <div className="flex min-h-dvh justify-center bg-[#e9edf4]">
        <div className="flex w-full max-w-[480px] flex-col bg-card px-6 pt-3 pb-8 min-[481px]:shadow-md">
          <Link
            href={USER_ROUTES.LOGIN}
            aria-label="Back to sign in"
            className="-ml-2.5 flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-[22px]" />
          </Link>
          <section aria-labelledby="auth-title" className={cn('page-in mt-6 flex flex-1 flex-col gap-5', className)}>
            {Icon ? (
              <span className="flex size-[52px] items-center justify-center rounded-2xl bg-brand-blue-50 text-primary" aria-hidden>
                <Icon className="size-[26px]" />
              </span>
            ) : null}
            <div>
              <h1 id="auth-title" className="text-[26px] leading-8 font-semibold tracking-[-0.025em]">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 text-[15px] leading-[22px] text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#e9edf4]">
      <div className="flex w-full max-w-[480px] flex-col bg-card min-[481px]:shadow-md">
        <section
          aria-label="About DX Enterprise"
          className="relative flex h-[280px] shrink-0 flex-col justify-between overflow-hidden bg-primary px-6 pt-7 pb-12 text-white"
        >
          <div aria-hidden className="absolute -top-8 -right-10 h-80 w-[70px] skew-x-[32deg] rounded bg-brand-green" />
          <div aria-hidden className="absolute -top-8 right-10 h-80 w-[70px] -skew-x-[32deg] bg-white/10" />
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
          <img src="/brand/dx-lockup-reversed.svg" alt="DX Enterprise" className="relative h-9 w-auto self-start" />
          <div className="relative">
            <p className="text-[30px] leading-9 font-semibold tracking-[-0.025em]">Claims in. Money back.</p>
            <p className="mt-2 text-[15px] leading-[22px] text-[#dbe5fd]">Snap a receipt, track approval and see when you&apos;re paid.</p>
          </div>
        </section>
        <section
          aria-labelledby="auth-title"
          className={cn('relative -mt-5 flex flex-1 flex-col gap-5 rounded-t-[24px] bg-card px-6 pt-7 pb-8', className)}
        >
          <div className="flex flex-col gap-1">
            <h1 id="auth-title" className="text-[22px] leading-[30px] font-semibold">
              {title}
            </h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
          <p className="mt-auto pt-4 text-center text-[13px] text-muted-foreground">
            Admin? Use the desktop portal at{' '}
            <Link href={ADMIN_ROUTES.LOGIN} className="font-medium text-foreground hover:underline">
              {ADMIN_ROUTES.LOGIN}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
