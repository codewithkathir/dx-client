import { EmployeeAuthLayout } from '@/components/layout/EmployeeAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function EmployeeLoginPage() {
  return (
    <EmployeeAuthLayout
      title={AUTH_LITERALS.USER.LOGIN_TITLE}
      subtitle={AUTH_LITERALS.USER.LOGIN_SUBTITLE}
    >
      <LoginForm portal={AUTH_PORTAL.USER} />
    </EmployeeAuthLayout>
  );
}
