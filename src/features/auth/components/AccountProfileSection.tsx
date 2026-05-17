'use client';

import { useState } from 'react';
import { Mail, Shield, User } from 'lucide-react';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthPortal } from '@/constants/auth.constants';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { ProfilePhotoUpload } from '@/features/employees/components/ProfilePhotoUpload';
import { useUpdateProfilePhoto } from '@/features/auth/hooks/useUpdateProfilePhoto';
import {
  adminProfilePhotoUrl,
  employeeSelfProfilePhotoUrl,
} from '@/features/auth/utils/auth-photo.utils';
import type { AdminProfile } from '@/types/admin-auth.types';
import type { EmployeeProfile } from '@/types/employee-auth.types';
import { cn } from '@/lib/utils';

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

interface AccountProfileSectionProps {
  portal: AuthPortal;
  isLoading: boolean;
  adminProfile?: AdminProfile | null;
  employeeProfile?: EmployeeProfile | null;
}

export function AccountProfileSection({
  portal,
  isLoading,
  adminProfile,
  employeeProfile,
}: AccountProfileSectionProps) {
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const uploadMutation = useUpdateProfilePhoto(portal);

  const isAdmin = portal === AUTH_PORTAL.ADMIN;
  const displayName = isAdmin ? adminProfile?.name : employeeProfile?.empName;
  const email = isAdmin ? adminProfile?.email : employeeProfile?.email;
  const hasPhoto = isAdmin
    ? Boolean(adminProfile?.profilePhoto)
    : Boolean(employeeProfile?.profilePhoto);
  const photoUrl = isAdmin ? adminProfilePhotoUrl() : employeeSelfProfilePhotoUrl();

  const handleSavePhoto = () => {
    if (!pendingPhoto) return;
    uploadMutation.mutate(pendingPhoto, {
      onSuccess: () => setPendingPhoto(null),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="size-5 text-muted-foreground" />
          Profile
        </CardTitle>
        <CardDescription>
          {isAdmin ? 'Your administrator account' : 'Your employee account information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {isLoading ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start">
              <AccountAvatar
                name={displayName ?? 'User'}
                photoFetchUrl={hasPhoto ? photoUrl : null}
                hasProfilePhoto={hasPhoto}
                size="xl"
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold tracking-tight">{displayName}</h3>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    {email}
                  </p>
                </div>
                {isAdmin && adminProfile ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={adminProfile.status === 'active' ? 'success' : 'muted'}>
                      {adminProfile.status}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="size-3.5" />
                      {adminProfile.role.replace('_', ' ')}
                    </Badge>
                  </div>
                ) : null}
                {!isAdmin && employeeProfile ? (
                  <StatusBadge status={employeeProfile.status} />
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Profile photo</h4>
              <ProfilePhotoUpload
                value={pendingPhoto}
                onChange={setPendingPhoto}
                existingPhotoFetchUrl={hasPhoto ? photoUrl : null}
                hasExistingPhoto={hasPhoto}
              />
              {pendingPhoto ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={uploadMutation.isPending}
                    onClick={handleSavePhoto}
                  >
                    {uploadMutation.isPending ? 'Uploading…' : 'Save photo'}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Account details</h4>
              {isAdmin && adminProfile ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Full name" value={adminProfile.name} />
                  <DetailItem label="Email" value={adminProfile.email} />
                  <DetailItem label="Role" value={adminProfile.role.replace('_', ' ')} />
                  <DetailItem
                    label="Status"
                    value={
                      <Badge variant={adminProfile.status === 'active' ? 'success' : 'muted'}>
                        {adminProfile.status}
                      </Badge>
                    }
                  />
                  <DetailItem label="Last login" value={formatDate(adminProfile.lastLoginAt)} />
                  <DetailItem
                    label="Member since"
                    value={formatDate(
                      typeof adminProfile.createdAt === 'string'
                        ? adminProfile.createdAt
                        : new Date(adminProfile.createdAt).toISOString(),
                    )}
                  />
                </dl>
              ) : null}
              {!isAdmin && employeeProfile ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Full name" value={employeeProfile.empName} />
                  <DetailItem label="Company" value={employeeProfile.companyName} />
                  <DetailItem label="Email" value={employeeProfile.email} />
                  <DetailItem label="Phone" value={employeeProfile.phoneNo} />
                  <DetailItem label="WhatsApp" value={employeeProfile.whatsappNo ?? '—'} />
                  <DetailItem label="Date of birth" value={employeeProfile.dob} />
                  <DetailItem label="City / State" value={employeeProfile.cityState} />
                  <DetailItem label="Country" value={employeeProfile.country} />
                  <DetailItem
                    label="Home address"
                    value={employeeProfile.homeAddress}
                    className="sm:col-span-2"
                  />
                  <DetailItem label="Role" value={employeeProfile.role} />
                  <DetailItem label="Last login" value={formatDate(employeeProfile.lastLoginAt)} />
                </dl>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
