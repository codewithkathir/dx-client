import { ShieldCheck } from 'lucide-react';

import {
  AuthSplitLayout,
  type AuthSplitLayoutProps,
} from '@/components/layout/AuthSplitLayout';
import { ADMIN_ROUTES } from '@/constants/routes.constants';

type AdminAuthLayoutProps = Pick<
  AuthSplitLayoutProps,
  'children' | 'title' | 'subtitle' | 'className' | 'coverImage' | 'coverAlt'
>;

export function AdminAuthLayout({
  children,
  title,
  subtitle,
  className,
  coverImage,
  coverAlt,
}: AdminAuthLayoutProps) {
  return (
    <AuthSplitLayout
      title={title}
      subtitle={subtitle}
      className={className}
      coverImage={coverImage}
      coverAlt={coverAlt ?? 'Admin portal login'}
      brandEyebrow="DX Admin"
      brandTitle="Management Portal"
      headline="Secure access for administrators"
      description="Manage employees, monitor operations, and keep your organization data protected with role-based access control."
      mobileBrandHref={ADMIN_ROUTES.LOGIN}
      mobileBrandLabel="DX Admin"
      MobileIcon={ShieldCheck}
    >
      {children}
    </AuthSplitLayout>
  );
}
