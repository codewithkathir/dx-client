import { EmployeeAuthLayout } from '@/components/layout/EmployeeAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function EmployeeForgotPasswordPage() {
  return (
    <EmployeeAuthLayout
      title={AUTH_LITERALS.USER.FORGOT_PASSWORD_TITLE}
      subtitle={AUTH_LITERALS.USER.FORGOT_PASSWORD_SUBTITLE}
    >
      <ForgotPasswordForm portal={AUTH_PORTAL.USER} />
    </EmployeeAuthLayout>
  );
}
