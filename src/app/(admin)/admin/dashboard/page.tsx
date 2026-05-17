import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';

export default function AdminDashboardPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TITLES.ADMIN_DASHBOARD}</h1>
      <p className="text-muted-foreground">{PAGE_DESCRIPTIONS.ADMIN_DASHBOARD}</p>
    </section>
  );
}
