'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Check, ChevronRight, Image as ImageIcon, Loader2, MessageSquareText, Pen, Trash, X } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { mobileButton } from '@/components/mobile/mobile.styles';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { USER_ROUTES } from '@/constants/routes.constants';
import { ExpenseAttachmentPreview } from '@/features/expenses/components/ExpenseAttachmentPreview';
import { getExpenseStage } from '@/features/expenses/components/ExpenseStageBadge';
import { useClaimLabels } from '@/features/expenses/hooks/useClaimLabels';
import { useExpenseMutations } from '@/features/expenses/hooks/useExpenseMutations';
import { useExpense, usePaymentMethodDropdown, useWhomDropdown } from '@/features/expenses/hooks/useExpenseQueries';
import { claimStage, isClaimEditable } from '@/features/expenses/utils/claim.utils';
import { formatExpenseDate, supportFileLabel } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import type { Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

function formatStamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

type StepState = 'done' | 'current' | 'failed' | 'todo';

function Step({ state, title, detail }: { state: StepState; title: string; detail?: string | null }) {
  return (
    <div className={cn('flex gap-3 text-sm', state === 'todo' && 'text-muted-foreground')}>
      <span
        aria-hidden
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full',
          state === 'done' && 'bg-primary text-white',
          state === 'failed' && 'bg-destructive text-white',
          state === 'current' && 'border-2 border-status-warning-ink bg-status-warning',
          state === 'todo' && 'border-2 border-[#c9d1dd]',
        )}
      >
        {state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : state === 'failed' ? <X className="size-3.5" strokeWidth={3} /> : null}
      </span>
      <div>
        {state === 'todo' ? title : <strong className="font-semibold">{title}</strong>}
        {detail ? <div className="text-[13px] text-muted-foreground">{detail}</div> : null}
      </div>
    </div>
  );
}

function Progress({ claim }: { claim: Expense }) {
  const stage = claimStage(claim);
  const reviewed = formatStamp(claim.reviewedAt);
  const paidOn = claim.reimbursement?.lastPaymentDate;
  const partlyPaid = claim.reimbursement?.status === 'partially_paid';
  return (
    <section aria-label="Progress" className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
      <Step state="done" title="Submitted" detail={formatStamp(claim.createdAt)} />
      {stage === 'pending' ? (
        <Step state="current" title="Awaiting approval" detail="You can still edit or delete this claim." />
      ) : stage === 'rejected' ? (
        <Step state="failed" title="Rejected" detail={reviewed} />
      ) : (
        <Step state="done" title="Approved" detail={reviewed} />
      )}
      {stage === 'rejected' ? null : stage === 'paid' ? (
        <Step state="done" title="Paid back to you" detail={paidOn ? formatExpenseDate(paidOn) : null} />
      ) : stage === 'approved' ? (
        <Step
          state="current"
          title={partlyPaid ? 'Partly paid back' : 'Waiting to be paid'}
          detail={
            partlyPaid && claim.reimbursement
              ? `${formatMoney(claim.reimbursement.amountPaid)} of ${formatMoney(claim.reimbursement.totalAmount)} paid so far`
              : 'Usually within 14 days of approval.'
          }
        />
      ) : (
        <Step state="todo" title="Paid back to you" />
      )}
    </section>
  );
}

/** Design "MobileExpenseDetail" + "MobileReceiptViewer" + "MobileSheetDelete". */
export function ClaimDetailContent() {
  const router = useRouter();
  const id = Number(useParams<{ id: string }>().id);
  const { data: claim, isLoading, isError, error, refetch } = useExpense(Number.isInteger(id) ? id : undefined);
  const { deleteExpense } = useExpenseMutations();
  const { data: whomOptions = [] } = useWhomDropdown();
  const { data: paymentMethods = [] } = usePaymentMethodDropdown();
  const { title, categoryPath } = useClaimLabels(claim ? [claim] : []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(false);

  const editable = claim ? isClaimEditable(claim) : false;
  const pill = claim ? getExpenseStage(claim) : null;

  return (
    <div className="flex min-h-full flex-col">
      <MobileTopBar
        title={`Claim #${Number.isInteger(id) ? id : ''}`}
        backHref={USER_ROUTES.EXPENSES}
        action={
          editable ? (
            <Link href={USER_ROUTES.EXPENSE_EDIT(id)} aria-label="Edit claim" className="flex size-11 items-center justify-center rounded-xl text-primary hover:bg-muted">
              <Pen className="size-5" />
            </Link>
          ) : null
        }
      />

      {isError ? (
        <div className="p-5">
          <ErrorPanel message={error?.message ?? "Couldn't load this claim"} onRetry={() => refetch()} />
        </div>
      ) : isLoading || !claim || !pill ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-28 w-full rounded-[14px]" />
          <Skeleton className="h-36 w-full rounded-[14px]" />
          <Skeleton className="h-48 w-full rounded-[14px]" />
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-4 px-5 pb-4">
            <section className="-mx-5 border-b border-border bg-card px-5 pt-2 pb-5 text-center">
              <div className="text-[13px] text-muted-foreground">
                {title(claim)} · {categoryPath(claim)}
              </div>
              <div className="mt-1 mb-2.5 text-4xl leading-[44px] font-semibold tracking-[-0.02em] tabular-nums">{formatMoney(claim.amount)}</div>
              <Badge variant={pill.variant} dot>
                {pill.label}
              </Badge>
            </section>

            <Progress claim={claim} />

            {claim.reviewNote ? (
              <section
                className={cn(
                  'flex gap-3 rounded-[14px] p-4 text-sm',
                  claimStage(claim) === 'rejected' ? 'bg-status-danger text-status-danger-ink' : 'bg-brand-blue-50 text-brand-blue-hover',
                )}
              >
                <MessageSquareText className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                <div>
                  <div className="font-semibold">Note from your administrator</div>
                  <p className="mt-0.5 whitespace-pre-line">{claim.reviewNote}</p>
                </div>
              </section>
            ) : null}

            <section aria-label="Details" className="overflow-hidden rounded-[14px] border border-border bg-card">
              <dl>
                {[
                  ['Date', formatExpenseDate(claim.date)],
                  ['Category', categoryPath(claim)],
                  ['Whom', whomOptions.find((w) => w.id === claim.whom)?.empName ?? '—'],
                  ['Paid with', paymentMethods.find((p) => p.id === claim.paymentMethodId)?.name ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 px-4 py-[13px] text-[15px] not-first:border-t not-first:border-border">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
                {claim.description ? (
                  <div className="border-t border-border px-4 py-[13px] text-[15px]">
                    <dt className="text-muted-foreground">What it was for</dt>
                    <dd className="mt-1 font-medium whitespace-pre-line">{claim.description}</dd>
                  </div>
                ) : null}
              </dl>
              {claim.supportFile ? (
                <button
                  type="button"
                  onClick={() => setViewingReceipt(true)}
                  className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left hover:bg-muted/50"
                >
                  <span className="flex size-11 items-center justify-center rounded-[10px] bg-muted text-muted-foreground" aria-hidden>
                    <ImageIcon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{supportFileLabel(claim.supportFile)}</span>
                    <span className="text-[13px] text-muted-foreground">Tap to view</span>
                  </span>
                  <ChevronRight className="size-[18px] text-input-border" aria-hidden />
                </button>
              ) : null}
            </section>
          </div>

          {editable ? (
            <div className="sticky bottom-0 grid grid-cols-2 gap-2.5 border-t border-border bg-card px-5 pt-3 pb-[max(28px,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => setConfirmDelete(true)} className={cn(mobileButton('plain'), 'text-destructive')}>
                Delete
              </button>
              <Link href={USER_ROUTES.EXPENSE_EDIT(claim.id)} className={mobileButton('primary')}>
                Edit claim
              </Link>
            </div>
          ) : null}

          <BottomSheet
            open={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            icon={Trash}
            tone="red"
            title="Delete this claim?"
            description={`${title(claim)} · ${formatMoney(claim.amount)}. It hasn't been approved yet, so you can delete it. This can't be undone.`}
          >
            <div className="mt-1 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={deleteExpense.isPending}
                className={mobileButton('danger')}
                onClick={() => deleteExpense.mutate(claim.id, { onSuccess: () => router.replace(USER_ROUTES.EXPENSES) })}
              >
                {deleteExpense.isPending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
                Delete claim
              </button>
              <button type="button" className={mobileButton('plain')} onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </div>
          </BottomSheet>

          {viewingReceipt && claim.supportFile ? (
            <div role="dialog" aria-modal="true" aria-label="Receipt" className="fixed inset-0 z-50 flex justify-center bg-[#0f1c2e]">
              <div className="flex w-full max-w-[480px] flex-col">
                <header className="flex items-center gap-3 px-4 pt-4 pb-3 text-white">
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setViewingReceipt(false)}
                    className="flex size-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    <X className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1 truncate text-[15px] font-medium">{supportFileLabel(claim.supportFile)}</div>
                </header>
                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-auto rounded-t-2xl bg-card p-3">
                  <ExpenseAttachmentPreview expenseId={claim.id} supportFile={claim.supportFile} variant="detail" />
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
