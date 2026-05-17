import Link from 'next/link';
import { Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { UI_PANEL } from '@/constants/ui.constants';
import { USER_ROUTES } from '@/constants/routes.constants';

export default function UserHomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TITLES.USER_HOME}</h1>
        <p className="text-muted-foreground">{PAGE_DESCRIPTIONS.USER_HOME}</p>
      </div>

      <Card className={UI_PANEL.content}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-5" />
            </div>
            <div>
              <h2 className="font-medium">{PAGE_TITLES.USER_EXPENSES}</h2>
              <p className="text-sm text-muted-foreground">{PAGE_DESCRIPTIONS.USER_EXPENSES}</p>
            </div>
          </div>
          <Button render={<Link href={USER_ROUTES.EXPENSES} />}>Manage expenses</Button>
        </div>
      </Card>
    </section>
  );
}
