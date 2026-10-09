'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Building, FolderTree, HandCoins, Landmark, LayoutDashboard, LogOut, Settings, Users, Wallet, type LucideIcon } from 'lucide-react';

import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { useAdminProfile } from '@/features/auth/hooks/useAdminProfile';
import { adminProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import { useDashboardAlerts } from '@/features/dashboard/hooks/useDashboard';
import { cn } from '@/lib/utils';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN_ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ADMIN_ROUTES.EMPLOYEES, label: 'Employees', icon: Briefcase },
  { href: ADMIN_ROUTES.CATEGORIES, label: 'Categories', icon: FolderTree },
  { href: ADMIN_ROUTES.EXPENSES, label: 'Expenses', icon: Wallet },
  { href: ADMIN_ROUTES.PAYABLES, label: 'Payables', icon: HandCoins },
  { href: ADMIN_ROUTES.SUPPLIERS, label: 'Suppliers', icon: Building },
  { href: ADMIN_ROUTES.RECEIVABLES, label: 'Receivables', icon: Landmark },
  { href: ADMIN_ROUTES.CUSTOMERS, label: 'Customers', icon: Users },
  { href: ADMIN_ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: 'Super admin', ADMIN: 'Admin' };

interface AdminSidebarProps {
  onNavigate?: () => void;
  onSignOut: () => void;
}

export function AdminSidebar({ onNavigate, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: alerts } = useDashboardAlerts();
  const { data: profile } = useAdminProfile();
  const pendingClaims = alerts?.pendingClaims ?? 0;

  return (
    <aside className="flex h-full w-[248px] flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground">
      <Link href={ADMIN_ROUTES.DASHBOARD} className="self-start" onClick={onNavigate}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/dx-lockup.svg" alt="DX Enterprise" className="h-9 w-auto" />
      </Link>

      <nav aria-label="Admin" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-10 shrink-0 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
              {label}
              {href === ADMIN_ROUTES.EXPENSES && pendingClaims > 0 ? (
                <span
                  className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums"
                  aria-label={`${pendingClaims} awaiting approval`}
                >
                  {pendingClaims}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-sidebar-border pt-4">
        <Link href={ADMIN_ROUTES.SETTINGS} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg">
          <AccountAvatar
            name={profile?.name ?? 'Admin'}
            photoFetchUrl={profile?.profilePhoto ? adminProfilePhotoUrl() : null}
            hasProfilePhoto={Boolean(profile?.profilePhoto)}
            size="sm"
            className="border-0 bg-brand-blue-50 font-semibold text-brand-blue-hover shadow-none"
          />
          <span className="min-w-0 flex-1 leading-[18px]">
            <span className="block truncate text-sm font-medium text-foreground">{profile?.name ?? '—'}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {profile ? ROLE_LABELS[profile.role] ?? profile.role : ''}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-[18px]" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
