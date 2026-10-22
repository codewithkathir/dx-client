'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { USER_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { ENTRY_TYPE_LABELS } from '@/features/employee-accounts/constants/employee-account.constants';
import { useMyAccount, useMyAccountEntries } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/money.utils';

/** Employee app: my advance balance and its statement. */
export function MyAccountContent() {
  const [page, setPage] = useState(1);
  const { data: account, isLoading, isError, error, refetch } = useMyAccount();
  const { data: entries, isLoading: entriesLoading } = useMyAccountEntries(page);
  const items = entries?.items ?? [];
  const meta = entries?.meta;

  return (
    <div className="flex flex-col gap-4 px-5 pb-6">
      <header className="flex items-center gap-2 pt-5">
        <Link href={USER_ROUTES.HOME} aria-label="Back" className="flex size-10 items-center justify-center rounded-xl hover:bg-muted">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">My advance</h1>
      </header>

      {isError ? (
        <ErrorPanel title="Couldn't load your account" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
      ) : isLoading || !account ? (
        <Skeleton className="h-[140px] rounded-[18px]" />
      ) : (
        <section aria-label="Balance" className="flex flex-col gap-3 rounded-[18px] bg-primary p-5 text-white">
          <div>
            <div className="text-[13px] text-[#dbe5fd]">Advance balance</div>
            <div className="text-[32px] leading-10 font-semibold tabular-nums">{formatMoney(account.balance)}</div>
            <div className="text-[13px] text-[#dbe5fd]">Approved claims are paid from this first; anything above it is reimbursed to you.</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/12 px-3 py-2.5">
              <div className="text-xs text-white">Claims awaiting approval</div>
              <div className="text-base font-semibold tabular-nums">{formatMoney(account.pendingClaims.amount)}</div>
            </div>
            <div className="rounded-xl bg-white/12 px-3 py-2.5">
              <div className="text-xs text-white">To be reimbursed</div>
              <div className="text-base font-semibold tabular-nums">{formatMoney(account.owedToEmployee)}</div>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="statement" className="flex flex-col gap-2.5">
        <h2 id="statement" className="text-base font-semibold">
          Statement
        </h2>
        {entriesLoading ? (
          <Skeleton className="h-[240px] rounded-[14px]" />
        ) : items.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <EmptyState title="No entries yet" description="Advances you receive and claims paid from them show here." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-border bg-card">
            {items.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3 not-first:border-t not-first:border-border">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">
                    {e.expenseId ? (
                      <Link href={USER_ROUTES.EXPENSE_DETAIL(e.expenseId)} className="hover:text-primary">
                        {e.expenseLabel ?? `Claim #${e.expenseId}`}
                      </Link>
                    ) : (
                      ENTRY_TYPE_LABELS[e.type]
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {[formatExpenseDate(e.entryDate), e.expenseId ? ENTRY_TYPE_LABELS[e.type] : e.notes].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn('text-[15px] font-semibold tabular-nums', e.amount > 0 ? 'text-status-success-ink' : undefined)}>
                    {e.amount > 0 ? '+' : '−'}
                    {formatMoney(Math.abs(e.amount))}
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">{formatMoney(e.runningBalance)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Newer
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Older
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
