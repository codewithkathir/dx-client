import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export const AUTH_LOGIN_COVER_IMAGE = '/auth/login-cover.jpg';

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  coverImage?: string;
  coverAlt?: string;
  brandEyebrow: string;
  brandTitle: string;
  headline: string;
  description: string;
  mobileBrandHref: string;
  mobileBrandLabel: string;
  MobileIcon: LucideIcon;
}

export function AuthSplitLayout({
  children,
  title,
  subtitle,
  className,
  coverImage = AUTH_LOGIN_COVER_IMAGE,
  coverAlt = 'Login cover',
  brandEyebrow,
  brandTitle,
  headline,
  description,
  mobileBrandHref,
  mobileBrandLabel,
  MobileIcon,
}: AuthSplitLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden min-h-screen lg:block">
        <Image
          src={coverImage}
          alt={coverAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/85 via-sidebar/55 to-sidebar/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/90 via-transparent to-sidebar/25" />

        <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/90 shadow-lg">
              <MobileIcon className="size-5 text-white" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {brandEyebrow}
              </p>
              <p className="text-lg font-semibold">{brandTitle}</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">{headline}</h2>
            <p className="text-base leading-relaxed text-white/85">{description}</p>
          </div>

          <p className="text-sm text-white/60">© {year} DX Platform. All rights reserved.</p>
        </div>
      </aside>

      <main
        className={cn(
          'flex min-h-screen flex-col justify-center bg-background px-6 py-10 sm:px-10 lg:px-14',
          className,
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 lg:hidden">
            <MobileIcon className="size-6 text-primary" aria-hidden />
            <Link href={mobileBrandHref} className="text-lg font-semibold text-foreground">
              {mobileBrandLabel}
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
