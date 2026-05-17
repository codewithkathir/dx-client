import { AdminAuthLayout } from '@/components/layout/AdminAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthLayout
      title={AUTH_LITERALS.ADMIN.FORGOT_PASSWORD_TITLE}
      subtitle={AUTH_LITERALS.ADMIN.FORGOT_PASSWORD_SUBTITLE}
    >
      <ForgotPasswordForm portal={AUTH_PORTAL.ADMIN} />
    </AdminAuthLayout>
  );
}
