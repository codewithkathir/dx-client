import Link from 'next/link';
import { Package } from 'lucide-react';

import { USER_ROUTES } from '@/constants/routes.constants';

/** Design "MobileOrders": orders aren't available yet, so this is the empty state. */
export default function UserOrdersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-1 bg-background px-5 pt-5 pb-3">
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Orders</h1>
        <p className="text-[13px] text-muted-foreground">Your orders and requests will appear here.</p>
      </header>
      <div className="flex flex-1 items-center justify-center px-8 pb-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-[18px] bg-brand-blue-50 text-primary" aria-hidden>
            <Package className="size-[30px]" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">No orders yet</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              When you request equipment or supplies, you&apos;ll track them here from request to delivery.
            </p>
          </div>
          <Link href={USER_ROUTES.HOME} className="inline-flex h-10 items-center rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-[#dce6fd]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
