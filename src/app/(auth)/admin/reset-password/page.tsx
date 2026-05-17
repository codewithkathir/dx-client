import { AdminAuthLayout } from '@/components/layout/AdminAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ResetPasswordFormWrapper } from '@/features/auth/components/ResetPasswordFormWrapper';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function AdminResetPasswordPage() {
  return (
    <AdminAuthLayout
      title={AUTH_LITERALS.ADMIN.RESET_PASSWORD_TITLE}
      subtitle="Choose a strong password for your admin account"
    >
      <ResetPasswordFormWrapper portal={AUTH_PORTAL.ADMIN} />
    </AdminAuthLayout>
  );
}
