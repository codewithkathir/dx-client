import { AdminAuthLayout } from '@/components/layout/AdminAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function AdminLoginPage() {
  return (
    <AdminAuthLayout
      title={AUTH_LITERALS.ADMIN.LOGIN_TITLE}
      subtitle={AUTH_LITERALS.ADMIN.LOGIN_SUBTITLE}
    >
      <LoginForm portal={AUTH_PORTAL.ADMIN} />
    </AdminAuthLayout>
  );
}
