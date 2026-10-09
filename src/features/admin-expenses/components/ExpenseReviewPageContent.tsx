'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { useAdminExpenseMutations } from '@/features/admin-expenses/hooks/useAdminExpenseMutations';
import { useAdminExpenses } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { useExpenseLookups } from '@/features/admin-expenses/hooks/useExpenseLookups';
import { canApprove, canReject } from '@/features/admin-expenses/utils/expense-decisions';
import { ExpenseAttachmentPreview } from '@/features/expenses/components/ExpenseAttachmentPreview';
import { ExpenseStageBadge } from '@/features/expenses/components/ExpenseStageBadge';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { Expense, ExpenseStage } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

const REVIEW_LIMIT = 100;
const REIMBURSEMENT_DUE_DAYS = 14;

const FILTERS: Array<{ value: ExpenseStage | 'all'; label: string }> = [
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All claims' },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const submittedAt = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Design "Expense review": work through claims one at a time. */
export function ExpenseReviewPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<ExpenseStage | 'all'>('pending');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminExpenses({
    page: 1,
    limit: REVIEW_LIMIT,
    sortBy: 'date',
    order: 'desc',
    ...(stage === 'all' ? {} : { stage }),
  });
  const { data: pendingData } = useAdminExpenses({ page: 1, limit: 1, stage: 'pending' });
  const lookups = useExpenseLookups();
  const { approveExpense, rejectExpense } = useAdminExpenseMutations();
  const claims = data?.items ?? [];
  const total = claims.reduce((sum, c) => sum + c.amount, 0);

  const requested = Number(searchParams.get('claim'));
  const selected = claims.find((c) => c.id === requested) ?? claims[0] ?? null;

  const select = (id: number | null) => {
    setNote('');
    setNoteError(null);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('claim', String(id));
    else params.delete('claim');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /** After a decision, move to the next claim in the list. */
  const next = (decidedId: number) => {
    const index = claims.findIndex((c) => c.id === decidedId);
    const following = claims[index + 1] ?? claims[index - 1] ?? null;
    select(following && following.id !== decidedId ? following.id : null);
  };

  const employeeName = (e: Expense) => lookups.employeeMap[e.employeeId] ?? `Employee #${e.employeeId}`;
  const shortName = (e: Expense) => {
    const [first, last] = employeeName(e).split(/\s+/);
    return last ? `${first} ${last[0]}.` : first ?? '';
  };
  const deciding = approveExpense.isPending || rejectExpense.isPending;

  const approve = (expense: Expense) =>
    approveExpense.mutate({ id: expense.id, note: note.trim() || null }, { onSuccess: () => next(expense.id) });
  const reject = (expense: Expense) => {
    if (!note.trim()) {
      setNoteError('Add a note telling the employee why the claim was rejected.');
      return;
    }
    rejectExpense.mutate({ id: expense.id, note: note.trim() }, { onSuccess: () => next(expense.id) });
  };

  const pendingCount = pendingData?.meta.total;

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_EXPENSES}
        description={PAGE_DESCRIPTIONS.ADMIN_EXPENSES}
        actions={
          <Select
            className="h-10 w-[220px]"
            aria-label="Filter claims"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value as ExpenseStage | 'all');
              select(null);
            }}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.value === 'pending' && pendingCount !== undefined ? `${f.label} (${pendingCount})` : f.label}
              </option>
            ))}
          </Select>
        }
      />

      {isError ? (
        <ErrorPanel title="Failed to load claims" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
      ) : null}

      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-0 flex-[1_1_340px] gap-0 py-0" aria-label="Claims">
          <div className="flex justify-between px-4 py-3.5 text-[13px] text-muted-foreground">
            <span>{data ? `${data.meta.total} claim${data.meta.total === 1 ? '' : 's'}` : '—'}</span>
            <span className="tabular-nums">{formatMoney(total)} total</span>
          </div>
          {isLoading ? (
            <div className="space-y-2 border-t border-border p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : claims.length === 0 ? (
            <div className="border-t border-border p-6">
              <EmptyState title="No claims here" description={stage === 'pending' ? 'Nothing is waiting for approval.' : 'Try another filter.'} />
            </div>
          ) : (
            <ul className="max-h-[calc(100dvh-280px)] overflow-y-auto">
              {claims.map((claim) => {
                const active = claim.id === selected?.id;
                return (
                  <li key={claim.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => select(claim.id)}
                      className={cn(
                        'flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left transition-colors',
                        active ? 'bg-brand-blue-50 shadow-[inset_3px_0_0_var(--primary)]' : 'bg-card hover:bg-background',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                          active ? 'bg-card text-brand-blue-hover' : 'bg-muted text-sidebar-foreground',
                        )}
                      >
                        {initials(employeeName(claim))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm', active ? 'font-semibold' : 'font-medium')}>
                          {claim.description ?? 'Expense claim'}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {shortName(claim)} · {lookups.categoryMap[claim.categoryId] ?? '—'} · {formatExpenseDate(claim.date)}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{formatMoney(claim.amount)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="min-w-0 flex-[2_1_480px] gap-0 py-0" aria-label="Selected claim">
          {!selected ? (
            <div className="p-8">
              <EmptyState title="Select a claim" description="Pick a claim on the left to review it." />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <ExpenseStageBadge expense={selected} showBillLink={false} />
                    <span className="text-xs text-muted-foreground">Claim #{selected.id}</span>
                  </div>
                  <h2 className="text-xl leading-7 font-semibold tracking-tight">{selected.description ?? 'Expense claim'}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted by {employeeName(selected)} on {submittedAt(selected.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Claim amount</div>
                  <div className="text-[28px] leading-9 font-semibold tracking-tight tabular-nums">{formatMoney(selected.amount)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-6">
                <dl className="m-0 grid min-w-0 flex-[1_1_260px] grid-cols-[120px_minmax(0,1fr)] content-start gap-x-4 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>
                    {lookups.categoryMap[selected.categoryId] ?? '—'}
                    {lookups.subCategoryMap[selected.subCategoryId] ? ` › ${lookups.subCategoryMap[selected.subCategoryId]}` : ''}
                  </dd>
                  <dt className="text-muted-foreground">Expense date</dt>
                  <dd>{formatExpenseDate(selected.date)}</dd>
                  <dt className="text-muted-foreground">Whom</dt>
                  <dd>{lookups.whomMap[selected.whom] ?? '—'}</dd>
                  <dt className="text-muted-foreground">Paid with</dt>
                  <dd>{lookups.paymentMap[selected.paymentMethodId] ?? '—'}</dd>
                  {selected.reimbursement && selected.reimbursement.status !== 'cancelled' ? (
                    <>
                      <dt className="text-muted-foreground">Reimbursement</dt>
                      <dd>
                        <Link href={`${ADMIN_ROUTES.PAYABLES}?bill=${selected.reimbursement.billId}`} className="text-primary hover:underline">
                          {selected.reimbursement.billNo}
                        </Link>{' '}
                        · {formatMoney(selected.reimbursement.amountPaid)} of {formatMoney(selected.reimbursement.totalAmount)} paid
                      </dd>
                    </>
                  ) : null}
                  {selected.reviewNote ? (
                    <>
                      <dt className="text-muted-foreground">Review note</dt>
                      <dd>{selected.reviewNote}</dd>
                    </>
                  ) : null}
                </dl>
                <figure className="m-0 flex min-w-0 flex-[0_1_220px] flex-col gap-2">
                  {selected.supportFile ? (
                    <ExpenseAttachmentPreview
                      key={selected.id}
                      expenseId={selected.id}
                      supportFile={selected.supportFile}
                      supportFileUrl={(id) => API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.SUPPORT_FILE(id)}
                      variant="detail"
                    />
                  ) : (
                    <div className="flex h-[260px] items-center justify-center rounded-[10px] border border-dashed border-input-border bg-background text-[13px] text-muted-foreground">
                      No receipt attached
                    </div>
                  )}
                </figure>
              </div>

              {canApprove(selected) || canReject(selected) ? (
                <>
                  <div className="space-y-2 px-6 pb-6">
                    <Label htmlFor="review-note">
                      Note to employee <span className="font-normal text-muted-foreground">(required if rejecting)</span>
                    </Label>
                    <Textarea
                      id="review-note"
                      value={note}
                      maxLength={1000}
                      aria-invalid={noteError ? true : undefined}
                      aria-describedby={noteError ? 'review-note-error' : undefined}
                      onChange={(e) => {
                        setNote(e.target.value);
                        if (e.target.value.trim()) setNoteError(null);
                      }}
                      placeholder="e.g. Please attach the itemised receipt"
                    />
                    {noteError ? (
                      <p id="review-note-error" className="text-sm text-destructive">
                        {noteError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-border bg-[#f8fafc] px-6 py-4">
                    <p className="m-0 flex-[1_1_240px] text-[13px] text-muted-foreground">
                      {canApprove(selected)
                        ? `Approving creates a reimbursement bill in Payables for ${formatMoney(selected.amount)}, due in ${REIMBURSEMENT_DUE_DAYS} days.`
                        : 'This claim is approved and unpaid. Rejecting cancels its reimbursement bill.'}
                    </p>
                    {canReject(selected) ? (
                      <Button variant="destructive" size="lg" disabled={deciding} onClick={() => reject(selected)}>
                        <X className="size-4" />
                        Reject
                      </Button>
                    ) : null}
                    {canApprove(selected) ? (
                      <Button loading={approveExpense.isPending} size="lg" className="min-w-[140px]" disabled={deciding} onClick={() => approve(selected)}>
                        <Check className="size-4" />
                        Approve claim
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
