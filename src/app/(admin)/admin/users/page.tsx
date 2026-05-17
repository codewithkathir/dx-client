import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';

export default function AdminUsersPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TITLES.ADMIN_USERS}</h1>
      <p className="text-muted-foreground">{PAGE_DESCRIPTIONS.ADMIN_USERS}</p>
    </section>
  );
}
