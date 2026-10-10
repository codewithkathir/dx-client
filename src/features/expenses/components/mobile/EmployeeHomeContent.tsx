'use client';

import Link from 'next/link';
import { Camera } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { mobileButton } from '@/components/mobile/mobile.styles';
import { Skeleton } from '@/components/ui/skeleton';
import { USER_ROUTES } from '@/constants/routes.constants';
import { useEmployeeProfile } from '@/features/auth/hooks/useEmployeeProfile';
import { ClaimRow } from '@/features/expenses/components/mobile/ClaimRow';
import { useClaimLabels } from '@/features/expenses/hooks/useClaimLabels';
import { useExpenseSummary, useExpenses } from '@/features/expenses/hooks/useExpenseQueries';
import { greeting } from '@/features/expenses/utils/claim.utils';
import { formatMoney } from '@/utils/money.utils';

const RECENT_FILTERS = { page: 1, limit: 4, order: 'desc' as const };

/** Design "MobileHome": reimbursement hero, snap-a-receipt, recent claims. */
export function EmployeeHomeContent() {
  const { data: profile } = useEmployeeProfile();
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary();
  const { data: recent, isLoading: recentLoading } = useExpenses(RECENT_FILTERS);
  const claims = recent?.items ?? [];
  const { title } = useClaimLabels(claims);
  const owed = summary?.toBeReimbursed;

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <header className="flex items-center gap-3 pt-5">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-muted-foreground">{greeting()}</div>
          <div className="truncate text-[17px] font-semibold">{profile?.empName ?? ' '}</div>
        </div>
      </header>

      <section aria-label="Your reimbursements" className="relative flex flex-col gap-4 overflow-hidden rounded-[18px] bg-primary p-5 text-white">
        <div aria-hidden className="absolute -top-5 -right-6 h-[180px] w-16 skew-x-[32deg] rounded bg-brand-green opacity-90" />
        <div className="relative">
          <div className="text-[13px] text-[#dbe5fd]">To be reimbursed</div>
          {summaryLoading ? (
            <div aria-hidden className="my-1 h-10 w-44 animate-pulse rounded-md bg-white/20" />
          ) : (
            <div className="text-[32px] leading-10 font-semibold tracking-[-0.02em] tabular-nums">{formatMoney(owed?.amount ?? 0)}</div>
          )}
          <div className="text-[13px] text-[#dbe5fd]">
            {owed && owed.count > 0
              ? `${owed.count} claim${owed.count === 1 ? '' : 's'} approved · waiting to be paid`
              : 'Nothing waiting to be paid'}
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/12 px-3 py-2.5">
            <div className="text-xs text-[#dbe5fd]">Awaiting approval</div>
            <div className="text-base font-semibold tabular-nums">{formatMoney(summary?.stages.pending.amount ?? 0)}</div>
          </div>
          <div className="rounded-xl bg-white/12 px-3 py-2.5">
            <div className="text-xs text-[#dbe5fd]">Paid this year</div>
            <div className="text-base font-semibold tabular-nums">{formatMoney(summary?.paidThisYear ?? 0)}</div>
          </div>
        </div>
      </section>

      <Link href={USER_ROUTES.EXPENSE_NEW} className={mobileButton('primary')}>
        <Camera className="size-5" />
        Snap a receipt
      </Link>

      <section aria-labelledby="recent-claims" className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-claims" className="text-base font-semibold">
            Recent claims
          </h2>
          <Link href={USER_ROUTES.EXPENSES} className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>
        {recentLoading ? (
          <Skeleton className="h-[280px] rounded-[14px]" />
        ) : claims.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <EmptyState title="No claims yet" description="Snap a receipt to submit your first expense claim." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            {claims.map((claim) => (
              <ClaimRow key={claim.id} expense={claim} title={title(claim)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
