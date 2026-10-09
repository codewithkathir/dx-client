'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Package, Plus, Receipt, User } from 'lucide-react';

import { LoadingBar } from '@/components/feedback/LoadingBar';
import { USER_ROUTES } from '@/constants/routes.constants';
import { cn } from '@/lib/utils';

const TABS = [
  { href: USER_ROUTES.HOME, label: 'Home', icon: House },
  { href: USER_ROUTES.EXPENSES, label: 'Expenses', icon: Receipt },
  { href: USER_ROUTES.EXPENSE_NEW, label: 'New expense', icon: Plus, primary: true },
  { href: USER_ROUTES.ORDERS, label: 'Orders', icon: Package },
  { href: USER_ROUTES.PROFILE, label: 'Profile', icon: User },
] as const;

/** Pushed screens (new / detail / edit) bring their own header and action bar instead of the tabs. */
function isPushedScreen(pathname: string): boolean {
  return pathname.startsWith(`${USER_ROUTES.EXPENSES}/`);
}

interface UserLayoutProps {
  children: React.ReactNode;
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
