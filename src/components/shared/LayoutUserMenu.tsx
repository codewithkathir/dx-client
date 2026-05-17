'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItemClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground outline-none transition-colors data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary';

interface LayoutUserMenuProps {
  profileHref: string;
  settingsHref: string;
  onConfirmSignOut: () => void;
  signOutPending?: boolean;
  signOutDescription?: string;
}

export function LayoutUserMenu({
  profileHref,
  settingsHref,
  onConfirmSignOut,
  signOutPending = false,
  signOutDescription = 'Are you sure you want to sign out?',
}: LayoutUserMenuProps) {
  const router = useRouter();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const openSignOutConfirm = () => {
    setLogoutConfirmOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Menu.Root>
          <Menu.Trigger
            className={cn(
              'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full',
              'text-sidebar-foreground transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
            )}
            aria-label="User menu"
          >
            <User className="size-5" strokeWidth={1.75} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="end" sideOffset={8}>
              <Menu.Popup className="z-50 min-w-44 rounded-lg border border-border bg-popover p-1 shadow-lg outline-none">
                <Menu.Item
                  className={menuItemClass}
                  onClick={() => router.push(profileHref)}
                >
                  <User className="size-[18px]" strokeWidth={1.75} />
                  Profile
                </Menu.Item>
                <Menu.Item
                  className={menuItemClass}
                  onClick={() => router.push(settingsHref)}
                >
                  <Settings className="size-[18px]" strokeWidth={1.75} />
                  Settings
                </Menu.Item>
                <Menu.Item
                  className={cn(menuItemClass, 'text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive')}
                  onClick={openSignOutConfirm}
                >
                  <LogOut className="size-[18px]" strokeWidth={1.75} />
                  Sign out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        <Button
          variant="ghost"
          size="sm"
          className="text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
          onClick={openSignOutConfirm}
          disabled={signOutPending}
        >
          <LogOut className="mr-2 size-[18px]" strokeWidth={1.75} />
          Sign out
        </Button>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out"
        description={signOutDescription}
        confirmText="Sign out"
        loading={signOutPending}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          onConfirmSignOut();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
}
