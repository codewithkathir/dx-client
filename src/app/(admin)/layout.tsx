import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AUTH_PORTAL } from '@/constants/auth.constants';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard portal={AUTH_PORTAL.ADMIN}>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
