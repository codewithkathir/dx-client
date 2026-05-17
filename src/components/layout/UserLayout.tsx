'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Receipt, User } from 'lucide-react';

import { LayoutUserMenu } from '@/components/shared/LayoutUserMenu';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { USER_ROUTES } from '@/constants/routes.constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { cn } from '@/lib/utils';

const USER_NAV = [
  { href: USER_ROUTES.HOME, label: 'Home', icon: Home },
  { href: USER_ROUTES.EXPENSES, label: 'Expenses', icon: Receipt },
  { href: USER_ROUTES.ORDERS, label: 'Orders', icon: Package },
  { href: USER_ROUTES.PROFILE, label: 'Profile', icon: User },
] as const;

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout(AUTH_PORTAL.USER);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <span className="font-semibold text-sidebar-foreground">DX Employee</span>
          <LayoutUserMenu
            profileHref={USER_ROUTES.PROFILE}
            settingsHref={USER_ROUTES.PROFILE}
            signOutDescription="Are you sure you want to sign out of your account?"
            signOutPending={logoutMutation.isPending}
            onConfirmSignOut={() => logoutMutation.mutate()}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 bg-background px-4 py-6">{children}</main>

      <nav className="sticky bottom-0 border-t border-sidebar-border bg-sidebar md:hidden">
        <div className="mx-auto flex max-w-5xl justify-around py-2">
          {USER_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors',
                  isActive
                    ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:text-sidebar-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-5',
                    isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/80',
                  )}
                  strokeWidth={1.75}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
