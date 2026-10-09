'use client';

import { useState } from 'react';
import { Camera, ChevronRight, Loader2, Lock, LogOut } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { mobileButton } from '@/components/mobile/mobile.styles';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { EmployeeProfileForm } from '@/features/auth/components/EmployeeProfileForm';
import { useEmployeeProfile } from '@/features/auth/hooks/useEmployeeProfile';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { employeeSelfProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';

type Sheet = 'edit' | 'password' | 'signOut' | null;

const STATUS_BADGE = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  suspended: { label: 'Suspended', variant: 'warning' },
} as const;

/** Design "MobileProfile" with the edit-profile, password and sign-out sheets. */
export function EmployeeProfilePageContent() {
  const { data: profile, isLoading, isError, error, refetch } = useEmployeeProfile();
  const logout = useLogout(AUTH_PORTAL.USER);
  const [sheet, setSheet] = useState<Sheet>(null);
  const close = () => setSheet(null);

  if (isError) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex flex-col gap-1 bg-background px-5 pt-5 pb-3">
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">Profile</h1>
          <p className="text-[13px] text-muted-foreground">Your account details and security.</p>
        </header>
        <div className="px-5">
          <ErrorPanel message={error?.message ?? 'Failed to load profile'} onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  const status = profile ? (STATUS_BADGE[profile.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.active) : null;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-1 bg-background px-5 pt-5 pb-3">
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Profile</h1>
        <p className="text-[13px] text-muted-foreground">Your account details and security.</p>
      </header>
      <div className="flex flex-col gap-4 px-5 pt-2 pb-6">
        <section aria-labelledby="profile-name" className="flex flex-col items-center gap-3 text-center">
          {isLoading || !profile ? (
            <>
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </>
          ) : (
            <>
              <div className="relative">
                <AccountAvatar
                  name={profile.empName}
                  photoFetchUrl={profile.profilePhoto ? employeeSelfProfilePhotoUrl() : null}
                  hasProfilePhoto={Boolean(profile.profilePhoto)}
                  size="lg"
                  className="bg-brand-blue-50 text-[28px] text-brand-blue-hover"
                />
                <button
                  type="button"
                  onClick={() => setSheet('edit')}
                  aria-label="Change photo"
                  className="absolute -right-0.5 -bottom-0.5 flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-white"
                >
                  <Camera className="size-4" />
                </button>
              </div>
              <div>
                <h2 id="profile-name" className="text-[22px] leading-7 font-semibold tracking-[-0.02em]">
                  {profile.empName}
                </h2>
                <p className="mt-0.5 mb-2 text-sm text-muted-foreground">Your employee account information</p>
                {status ? (
                  <Badge variant={status.variant} dot>
                    {status.label}
                  </Badge>
                ) : null}
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="account-details" className="overflow-hidden rounded-[14px] border border-border bg-card">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
            <h2 id="account-details" className="text-[15px] font-semibold">
              Account details
            </h2>
            <button type="button" disabled={!profile} onClick={() => setSheet('edit')} className="text-sm font-medium text-primary">
              Edit profile
            </button>
          </div>
          <dl>
            {profile
              ? [
                  ['Email', profile.email],
                  ['Company', profile.companyName],
                  ['Phone', profile.phoneNo],
                  ['WhatsApp', profile.whatsappNo ?? '—'],
                  ['Date of birth', profile.dob ? formatExpenseDate(profile.dob) : '—'],
                  ['City / State', [profile.cityState, profile.country].filter(Boolean).join(', ') || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-t border-border px-4 py-3 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
                  </div>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border-t border-border px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
          </dl>
        </section>

        <section aria-label="Security" className="overflow-hidden rounded-[14px] border border-border bg-card">
          <button
            type="button"
            onClick={() => setSheet('password')}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-medium hover:bg-muted/50"
          >
            <Lock className="size-5 text-muted-foreground" aria-hidden />
            <span className="flex-1">Change password</span>
            <ChevronRight className="size-[18px] text-input-border" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setSheet('signOut')}
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left text-[15px] font-medium text-destructive hover:bg-muted/50"
          >
            <LogOut className="size-5" aria-hidden />
            <span className="flex-1">Sign out</span>
          </button>
        </section>

        <BottomSheet open={sheet === 'edit' && Boolean(profile)} onClose={close} title="Edit profile" showCancel>
          {profile ? <EmployeeProfileForm profile={profile} onDone={close} /> : null}
          <p className="text-sm text-muted-foreground">Email, company and documents are managed by your administrator.</p>
        </BottomSheet>

        <BottomSheet
          open={sheet === 'password'}
          onClose={close}
          title="Change password"
          description="You'll stay signed in on this phone."
          showCancel
        >
          <ChangePasswordForm portal={AUTH_PORTAL.USER} onSuccess={close} />
        </BottomSheet>

        <BottomSheet
          open={sheet === 'signOut'}
          onClose={close}
          icon={LogOut}
          title="Sign out?"
          description="You'll need your email and password to sign in again on this phone."
        >
          <div className="mt-1 flex flex-col gap-2.5">
            <button type="button" className={mobileButton('primary')} disabled={logout.isPending} onClick={() => logout.mutate()}>
              {logout.isPending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
              Sign out
            </button>
            <button type="button" className={mobileButton('plain')} onClick={close}>
              Cancel
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
