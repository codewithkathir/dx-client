import { Briefcase } from 'lucide-react';

import {
  AuthSplitLayout,
  type AuthSplitLayoutProps,
} from '@/components/layout/AuthSplitLayout';
import { USER_ROUTES } from '@/constants/routes.constants';

type EmployeeAuthLayoutProps = Pick<
  AuthSplitLayoutProps,
  'children' | 'title' | 'subtitle' | 'className' | 'coverImage' | 'coverAlt'
>;

export function EmployeeAuthLayout({
  children,
  title,
  subtitle,
  className,
  coverImage,
  coverAlt,
}: EmployeeAuthLayoutProps) {
  return (
    <AuthSplitLayout
      title={title}
      subtitle={subtitle}
      className={className}
      coverImage={coverImage}
      coverAlt={coverAlt ?? 'Employee portal login'}
      brandEyebrow="DX Employee"
      brandTitle="Portal"
      headline="Your workspace, anywhere"
      description="Sign in to view your profile, manage account security, and access employee services."
      mobileBrandHref={USER_ROUTES.LOGIN}
      mobileBrandLabel="DX Employee"
      MobileIcon={Briefcase}
    >
      {children}
    </AuthSplitLayout>
  );
}
