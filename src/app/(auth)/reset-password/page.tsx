import { EmployeeAuthLayout } from '@/components/layout/EmployeeAuthLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';
import { ResetPasswordFormWrapper } from '@/features/auth/components/ResetPasswordFormWrapper';
import { AUTH_LITERALS } from '@/features/auth/literals/auth.literal';

export default function EmployeeResetPasswordPage() {
  return (
    <EmployeeAuthLayout
      title={AUTH_LITERALS.USER.RESET_PASSWORD_TITLE}
      subtitle={AUTH_LITERALS.USER.RESET_PASSWORD_SUBTITLE}
    >
      <ResetPasswordFormWrapper portal={AUTH_PORTAL.USER} />
    </EmployeeAuthLayout>
  );
}
