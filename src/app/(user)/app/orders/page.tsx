import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';

export default function UserOrdersPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TITLES.USER_ORDERS}</h1>
      <p className="text-muted-foreground">{PAGE_DESCRIPTIONS.USER_ORDERS}</p>
    </section>
  );
}
