'use client';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { AccountProfileSection } from '@/features/auth/components/AccountProfileSection';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { useEmployeeProfile } from '@/features/auth/hooks/useEmployeeProfile';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';

export function EmployeeProfilePageContent() {
  const { data: profile, isLoading, isError, error, refetch } = useEmployeeProfile();

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.USER_PROFILE}
        description={PAGE_DESCRIPTIONS.USER_PROFILE}
      />

      {isError ? (
        <ErrorPanel message={error?.message ?? 'Failed to load profile'} onRetry={() => refetch()} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AccountProfileSection
            portal={AUTH_PORTAL.USER}
            isLoading={isLoading}
            employeeProfile={profile}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm portal={AUTH_PORTAL.USER} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
