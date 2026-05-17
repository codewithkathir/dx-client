'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FolderTree,
  LayoutDashboard,
  Menu,
  Settings,
  Wallet,
} from 'lucide-react';

import { LayoutUserMenu } from '@/components/shared/LayoutUserMenu';
import { Button } from '@/components/ui/button';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { cn } from '@/lib/utils';
import { selectSidebarOpen } from '@/store/sidebar/sidebar.selectors';
import { toggleSidebar } from '@/store/sidebar/sidebar.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const ADMIN_NAV = [
  { href: ADMIN_ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ADMIN_ROUTES.EMPLOYEES, label: 'Employees', icon: Briefcase },
  { href: ADMIN_ROUTES.CATEGORIES, label: 'Categories', icon: FolderTree },
  { href: ADMIN_ROUTES.EXPENSES, label: 'Expenses', icon: Wallet },
  { href: ADMIN_ROUTES.SETTINGS, label: 'Settings', icon: Settings },
] as const;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectSidebarOpen);
  const logoutMutation = useLogout(AUTH_PORTAL.ADMIN);

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          'hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex lg:flex-col',
          isSidebarOpen ? 'w-64' : 'w-16',
        )}
      >
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 text-sm font-semibold text-sidebar-foreground">
          {isSidebarOpen ? 'Admin Portal' : 'AP'}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isActive &&
                    'bg-sidebar-primary font-medium text-sidebar-primary-foreground shadow-sm',
                )}
              >
                <Icon
                  className={cn(
                    'size-[18px] shrink-0',
                    isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground',
                  )}
                  strokeWidth={1.75}
                />
                {isSidebarOpen ? <span>{label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <Menu className="size-[18px]" strokeWidth={1.75} />
          </Button>
          <span className="flex-1 text-sm font-medium text-sidebar-foreground">
            Admin Portal
          </span>
          <LayoutUserMenu
            profileHref={ADMIN_ROUTES.SETTINGS}
            settingsHref={ADMIN_ROUTES.SETTINGS}
            signOutDescription="Are you sure you want to sign out of the admin portal?"
            signOutPending={logoutMutation.isPending}
            onConfirmSignOut={() => logoutMutation.mutate()}
          />
        </header>
        <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
