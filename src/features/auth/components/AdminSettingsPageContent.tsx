'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Camera, Pen, ShieldCheck, User } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { FormField } from '@/components/forms/FormField';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { AdminProfileForm } from '@/features/auth/components/AdminProfileForm';
import { useAdminProfile } from '@/features/auth/hooks/useAdminProfile';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/schemas/change-password.schema';
import { adminProfilePhotoUrl } from '@/features/auth/utils/auth-photo.utils';
import type { AdminProfile } from '@/types/admin-auth.types';

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: 'Super admin', ADMIN: 'Admin' };

function formatDateTime(value: string | null, withTime = true): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(date);
}

function ProfileCard({ profile, onEdit }: { profile: AdminProfile; onEdit: () => void }) {
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  return (
    <Card className="gap-0 py-0" aria-labelledby="settings-profile">
      <div className="flex flex-wrap items-center gap-5 p-6">
        <div className="relative">
          <AccountAvatar
            name={profile.name}
            photoFetchUrl={profile.profilePhoto ? adminProfilePhotoUrl() : null}
            hasProfilePhoto={Boolean(profile.profilePhoto)}
            size="lg"
            className="size-20 bg-brand-blue-50 text-[26px] text-brand-blue-hover"
          />
          <button
            type="button"
            onClick={onEdit}
            aria-label="Upload profile photo"
            className="absolute -right-0.5 -bottom-0.5 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-white transition-colors hover:bg-primary-hover"
          >
            <Camera className="size-[15px]" />
          </button>
        </div>
        <div className="min-w-0 flex-[1_1_240px]">
          <h2 id="settings-profile" className="text-xl font-semibold">
            {profile.name}
          </h2>
          <p className="mt-0.5 mb-2 text-sm text-muted-foreground">Your administrator account</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={profile.status === 'active' ? 'success' : 'muted'} dot>
              {profile.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
        </div>
        <Button variant="outline" size="lg" onClick={onEdit}>
          <Pen className="size-4" />
          Edit profile
        </Button>
      </div>
      <div className="border-t border-border px-6 py-5">
        <h3 className="mb-4 text-sm font-semibold">Account details</h3>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-[18px]">
          {[
            ['Full name', profile.name],
            ['Email', profile.email],
            ['Role', roleLabel],
            ['Last login', formatDateTime(profile.lastLoginAt)],
            ['Member since', formatDateTime(profile.createdAt, false)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[13px] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

function SecurityCard() {
  const mutation = useChangePassword(AUTH_PORTAL.ADMIN);
  const { register, handleSubmit, formState, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { errors } = formState;

  return (
    <Card className="gap-0 py-0" aria-labelledby="settings-security">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-brand-blue-50 text-primary" aria-hidden>
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 id="settings-security" className="text-base font-semibold">
            Security
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Change your password. You will stay signed in on this device.</p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values, { onSuccess: () => reset() }))}
        className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-6"
        noValidate
      >
        <FormField label="Current password" htmlFor="oldPassword" required error={errors.oldPassword?.message}>
          <Input id="oldPassword" type="password" autoComplete="current-password" {...register('oldPassword')} />
        </FormField>
        <FormField label="New password" htmlFor="newPassword" required error={errors.newPassword?.message}>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>
        <div className="col-span-full flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" size="lg" onClick={() => reset()} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} type="submit" size="lg" disabled={mutation.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** Design "Settings": profile card + security card, single column. */
export function AdminSettingsPageContent() {
  const { data: profile, isLoading, isError, error, refetch } = useAdminProfile();
  const [editing, setEditing] = useState(false);

  return (
    <section className="max-w-[976px] space-y-5">
      <PageHeader title={PAGE_TITLES.ADMIN_SETTINGS} description={PAGE_DESCRIPTIONS.ADMIN_SETTINGS} />

      {isError ? <ErrorPanel message={error?.message ?? 'Failed to load profile'} onRetry={() => refetch()} /> : null}

      {isLoading || !profile ? (
        <Card className="flex-row items-center gap-5 p-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </Card>
      ) : (
        <ProfileCard profile={profile} onEdit={() => setEditing(true)} />
      )}

      <SecurityCard />

      <Dialog open={editing && Boolean(profile)} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent onClose={() => setEditing(false)} className="max-w-[540px]">
          <DialogIconHeader icon={User} title="Edit profile" description="Your administrator account details." />
          <DialogBody>{profile ? <AdminProfileForm profile={profile} onDone={() => setEditing(false)} /> : null}</DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
