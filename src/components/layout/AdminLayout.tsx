'use client';

import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { LoadingBar } from '@/components/feedback/LoadingBar';
import { AdminTopbar } from '@/components/layout/AdminTopbar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { cn } from '@/lib/utils';
import { selectMobileSidebarOpen } from '@/store/sidebar/sidebar.selectors';
import { setMobileSidebarOpen } from '@/store/sidebar/sidebar.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin shell (desktop-first): fixed sidebar and top bar; only <main> scrolls.
 * Below `lg` the sidebar becomes a slide-in drawer opened from the top bar.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isDrawerOpen = useAppSelector(selectMobileSidebarOpen);
  const logoutMutation = useLogout(AUTH_PORTAL.ADMIN);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Only <main> scrolls, so start each page at the top of it; close the drawer on navigation.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    dispatch(setMobileSidebarOpen(false));
  }, [pathname, dispatch]);

  const closeDrawer = () => dispatch(setMobileSidebarOpen(false));
  const signOut = () => setConfirmSignOut(true);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <div className="hidden shrink-0 lg:flex">
        <AdminSidebar onSignOut={signOut} />
      </div>

      {/* Drawer for narrower screens */}
      <div
        className={cn('fixed inset-0 z-40 lg:hidden', isDrawerOpen ? 'visible' : 'invisible')}
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={isDrawerOpen ? 0 : -1}
          onClick={closeDrawer}
          className={cn('absolute inset-0 bg-[var(--scrim)] transition-opacity', isDrawerOpen ? 'opacity-100' : 'opacity-0')}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 shadow-dialog transition-transform duration-200',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <AdminSidebar onNavigate={closeDrawer} onSignOut={signOut} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenMenu={() => dispatch(setMobileSidebarOpen(true))} />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <LoadingBar />
          <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
            {/* Keyed by route so each page fades in on navigation. */}
            <div key={pathname} className="page-in mx-auto w-full max-w-[1280px] px-4 pt-7 pb-10 sm:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        icon={LogOut}
        tone="neutral"
        title="Sign out"
        description="Are you sure you want to sign out of the admin portal?"
        confirmText="Sign out"
        loading={logoutMutation.isPending}
        onConfirm={() => logoutMutation.mutate()}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
}
