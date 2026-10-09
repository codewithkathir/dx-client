'use client';

import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { ClaimRow } from '@/features/expenses/components/mobile/ClaimRow';
import { useClaimLabels } from '@/features/expenses/hooks/useClaimLabels';
import { useExpenseSummary, useExpenses } from '@/features/expenses/hooks/useExpenseQueries';
import { monthLabel, shortDate } from '@/features/expenses/utils/claim.utils';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseStage } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

const PAGE = 20;
const MAX = 100;

const CHIPS: Array<{ value: ExpenseStage | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

function groupByMonth(claims: Expense[]): Array<{ key: string; label: string; total: number; claims: Expense[] }> {
  const groups = new Map<string, Expense[]>();
  for (const claim of claims) {
    const key = claim.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), claim]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    key,
    label: monthLabel(list[0]!.date),
    total: Math.round(list.reduce((sum, c) => sum + c.amount * 100, 0)) / 100,
    claims: list,
  }));
}

/** Design "MobileExpenses": stage chips, then claims grouped by month. */
export function MyExpensesContent() {
  const [stage, setStage] = useState<ExpenseStage | ''>('');
  const [limit, setLimit] = useState(PAGE);
  const { data: summary } = useExpenseSummary();
  const { data, isLoading, isError, error, refetch, isFetching } = useExpenses({
    page: 1,
    limit,
    sortBy: 'date',
    order: 'desc',
    stage: stage || undefined,
  });
  const claims = useMemo(() => data?.items ?? [], [data]);
  const groups = useMemo(() => groupByMonth(claims), [claims]);
  const { title, categoryPath } = useClaimLabels(claims);
  const total = data?.meta.total ?? 0;

  const count = (value: ExpenseStage | '') => {
    if (!summary) return null;
    if (!value) return Object.values(summary.stages).reduce((sum, s) => sum + s.count, 0);
    return summary.stages[value].count;
  };

  return (
    <div className="flex flex-col pb-6">
      <header className="flex flex-col gap-1 px-5 pt-5 pb-3">
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">My expenses</h1>
        <p className="text-[13px] leading-[18px] text-muted-foreground">You can edit or delete a claim until an administrator approves it.</p>
      </header>

      <div role="radiogroup" aria-label="Filter claims" className="flex gap-2 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
        {CHIPS.map((chip) => {
          const on = stage === chip.value;
          const n = count(chip.value);
          return (
            <button
              key={chip.label}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setStage(chip.value);
                setLimit(PAGE);
              }}
              className={cn(
                'h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors',
                on ? 'border-primary bg-primary text-primary-foreground' : 'border-input-border bg-card text-[#33415a]',
              )}
            >
              {chip.label}
              {n !== null ? ` · ${n}` : ''}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 px-5">
        {isError ? (
          <ErrorPanel title="Couldn't load your claims" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
        ) : isLoading ? (
          <>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-[320px] rounded-[14px]" />
          </>
        ) : claims.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <EmptyState
              title={stage ? 'No claims here' : 'No claims yet'}
              description={stage ? 'Try another filter.' : 'Tap + to submit your first expense claim.'}
            />
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key} aria-labelledby={`m-${group.key}`}>
              <h2
                id={`m-${group.key}`}
                className="mb-2 flex justify-between text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase"
              >
                <span>{group.label}</span>
                <span className="tabular-nums">{formatMoney(group.total)}</span>
              </h2>
              <div className="overflow-hidden rounded-[14px] border border-border bg-card">
                {group.claims.map((claim) => (
                  <ClaimRow
                    key={claim.id}
                    expense={claim}
                    showIcon={false}
                    title={title(claim)}
                    meta={[
                      shortDate(claim.date),
                      categoryPath(claim),
                      claim.adminStatus === 'paid' && claim.reimbursement?.lastPaymentDate
                        ? `paid ${shortDate(claim.reimbursement.lastPaymentDate)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {claims.length > 0 && claims.length < total ? (
          limit < MAX ? (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setLimit((l) => Math.min(l + PAGE, MAX))}
              className="h-11 rounded-xl border border-input-border bg-card text-sm font-medium"
            >
              {isFetching ? 'Loading…' : `Show more (${total - claims.length} older)`}
            </button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Showing your latest {MAX} claims.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
