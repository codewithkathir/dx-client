import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserLayout } from '@/components/layout/UserLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';

export default function UserRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard portal={AUTH_PORTAL.USER}>
      <UserLayout>{children}</UserLayout>
    </AuthGuard>
  );
}
