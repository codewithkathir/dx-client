'use client';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { AccountProfileSection } from '@/features/auth/components/AccountProfileSection';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { useAdminProfile } from '@/features/auth/hooks/useAdminProfile';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';

export function AdminSettingsPageContent() {
  const { data: profile, isLoading, isError, error, refetch } = useAdminProfile();

  return (
    <section className="space-y-8">
      <PageHeader
        title={PAGE_TITLES.ADMIN_SETTINGS}
        description={PAGE_DESCRIPTIONS.ADMIN_SETTINGS}
      />

      {isError ? (
        <ErrorPanel message={error?.message ?? 'Failed to load profile'} onRetry={() => refetch()} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AccountProfileSection
            portal={AUTH_PORTAL.ADMIN}
            isLoading={isLoading}
            adminProfile={profile}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm portal={AUTH_PORTAL.ADMIN} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
