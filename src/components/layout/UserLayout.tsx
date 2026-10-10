'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Laptop, Plus, Receipt, User } from 'lucide-react';

import { LoadingBar } from '@/components/feedback/LoadingBar';
import { USER_ROUTES } from '@/constants/routes.constants';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { useEmployeeProfile } from '@/features/auth/hooks/useEmployeeProfile';
import { employeeSelfProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import { cn } from '@/lib/utils';

const TABS = [
  { href: USER_ROUTES.HOME, label: 'Home', icon: House },
  { href: USER_ROUTES.EXPENSES, label: 'Expenses', icon: Receipt },
  { href: USER_ROUTES.EXPENSE_NEW, label: 'New expense', icon: Plus, primary: true },
  { href: USER_ROUTES.ASSETS, label: 'Assets', icon: Laptop },
  { href: USER_ROUTES.PROFILE, label: 'Profile', icon: User },
] as const;

/** Pushed screens (new / detail / edit) bring their own header and action bar instead of the tabs. */
function isPushedScreen(pathname: string): boolean {
  return pathname.startsWith(`${USER_ROUTES.EXPENSES}/`);
}

interface UserLayoutProps {
  children: React.ReactNode;
}

/** Logo on the left, the employee's photo on the right (opens Profile). Shown on every screen. */
function AppHeader() {
  const { data: profile } = useEmployeeProfile();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <Link href={USER_ROUTES.HOME} aria-label="DX Enterprise home" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
        <img src="/brand/dx-lockup.svg" alt="DX Enterprise" className="h-7 w-auto" />
      </Link>
      <Link
        href={USER_ROUTES.PROFILE}
        aria-label="Your profile"
        className="rounded-full ring-offset-2 ring-offset-card transition-shadow hover:ring-2 hover:ring-brand-blue-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <AccountAvatar
          name={profile?.empName ?? 'Profile'}
          photoFetchUrl={profile?.profilePhoto ? employeeSelfProfilePhotoUrl() : null}
          hasProfilePhoto={Boolean(profile?.profilePhoto)}
          size="sm"
          className="bg-brand-blue-50 text-brand-blue-hover"
        />
      </Link>
    </header>
  );
}

/** Employee app: a phone-width column with a bottom tab bar (design "Employee · Mobile"). */
export function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const showTabs = !isPushedScreen(pathname);

  // Only <main> scrolls, so start each screen at the top of it.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-dvh justify-center bg-[#e9edf4]">
      <div className="flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-background shadow-[0_0_0_1px_var(--border)] min-[481px]:shadow-md">
        <AppHeader />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <LoadingBar />
          <main ref={mainRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* Keyed by route so each screen fades in on navigation. */}
            <div key={pathname} className="page-in flex min-h-full flex-1 flex-col">
              {children}
            </div>
          </main>
        </div>

        {showTabs ? (
          <nav aria-label="Main" className="flex shrink-0 items-center border-t border-border bg-card px-2 pt-1 pb-[max(12px,env(safe-area-inset-bottom))]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              if ('primary' in tab) {
                return (
                  <Link key={tab.href} href={tab.href} aria-label={tab.label} className="flex h-14 flex-1 items-center justify-center">
                    <span className="-mt-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_12px_-2px_rgba(31,79,209,.45)]">
                      <Icon className="size-[22px]" strokeWidth={2.5} />
                    </span>
                  </Link>
                );
              }
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-[22px]" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
