'use client';

import Link from 'next/link';
import { Check, Receipt, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { ExpenseAttachmentPreview } from '@/features/expenses/components/ExpenseAttachmentPreview';
import { ExpenseStageBadge } from '@/features/expenses/components/ExpenseStageBadge';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

interface Lookups {
  employeeMap: Record<number, string>;
  categoryMap: Record<number, string>;
  subCategoryMap: Record<number, string>;
  whomMap: Record<number, string>;
  paymentMap: Record<number, string>;
}

interface ExpenseDetailDialogProps {
  expense: Expense | null;
  lookups: Lookups;
  onClose: () => void;
  onApprove: (expense: Expense) => void;
  onReject: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  canApprove: (expense: Expense) => boolean;
  canReject: (expense: Expense) => boolean;
}

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 text-sm ${wide ? 'leading-[21px]' : 'font-medium'}`}>{children}</dd>
    </div>
  );
}

/** Design "ModalExpenseDetail": amount + stage, details grid, history and receipt. */
export function ExpenseDetailDialog({
  expense,
  lookups,
  onClose,
  onApprove,
  onReject,
  onDelete,
  canApprove,
  canReject,
}: ExpenseDetailDialogProps) {
  if (!expense) return null;
  const employee = lookups.employeeMap[expense.employeeId] ?? `Employee #${expense.employeeId}`;
  const bill = expense.reimbursement && expense.reimbursement.status !== 'cancelled' ? expense.reimbursement : null;
  const decided = expense.employeeStatus !== 'pending' && expense.reviewedAt;
  const canDelete = (expense.reimbursement?.amountPaid ?? 0) === 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[760px]">
        <DialogHeader className="flex-row items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-primary" aria-hidden>
            <Receipt className="size-[22px]" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle>Expense details</DialogTitle>
            <DialogDescription>
              Claim #{expense.id} · submitted by {employee} on {formatExpenseDate(expense.createdAt.slice(0, 10))}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[13px] text-muted-foreground">Amount</div>
                <div className="text-[28px] leading-9 font-semibold tracking-tight tabular-nums">{formatMoney(expense.amount)}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ExpenseStageBadge expense={expense} showBillLink={false} />
                {bill ? (
                  <Link href={`${ADMIN_ROUTES.PAYABLES}?bill=${bill.billId}`} className="text-xs text-primary hover:underline">
                    Reimbursed via {bill.billNo}
                  </Link>
                ) : null}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <Field label="Date">{formatExpenseDate(expense.date)}</Field>
              <Field label="Employee">{employee}</Field>
              <Field label="Whom">{lookups.whomMap[expense.whom] ?? '—'}</Field>
              <Field label="Payment">{lookups.paymentMap[expense.paymentMethodId] ?? '—'}</Field>
              <Field label="Category">{lookups.categoryMap[expense.categoryId] ?? '—'}</Field>
              <Field label="Sub category">{lookups.subCategoryMap[expense.subCategoryId] ?? '—'}</Field>
              {expense.description ? (
                <Field label="Description" wide>
                  {expense.description}
                </Field>
              ) : null}
            </dl>

            <section aria-label="History" className="flex flex-col gap-2.5 pt-1 text-[13px]">
              {decided && expense.reviewedAt ? (
                <div className="flex gap-2.5">
                  <span
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${expense.employeeStatus === 'rejected' ? 'bg-destructive' : 'bg-primary'}`}
                    aria-hidden
                  />
                  <div>
                    <strong className="font-semibold">{expense.employeeStatus === 'rejected' ? 'Rejected' : 'Approved'}</strong> ·{' '}
                    {dateTime(expense.reviewedAt)}
                    {bill && expense.employeeStatus === 'approved' ? (
                      <div className="text-muted-foreground">Bill {bill.billNo} created in Payables.</div>
                    ) : null}
                    {expense.reviewNote ? <div className="text-muted-foreground">“{expense.reviewNote}”</div> : null}
                  </div>
                </div>
              ) : null}
              <div className="flex gap-2.5">
                <span className="mt-1 size-2.5 shrink-0 rounded-full bg-input-border" aria-hidden />
                <div>
                  <strong className="font-semibold">Submitted</strong> by {employee} · {dateTime(expense.createdAt)}
                </div>
              </div>
            </section>
          </div>

          <figure className="m-0 flex min-w-0 flex-[0_1_240px] flex-col gap-2">
            {expense.supportFile ? (
              <ExpenseAttachmentPreview
                expenseId={expense.id}
                supportFile={expense.supportFile}
                supportFileUrl={(id) => API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.SUPPORT_FILE(id)}
                variant="detail"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-background text-[13px] text-muted-foreground">
                No receipt attached
              </div>
            )}
          </figure>
        </DialogBody>

        <DialogFooter className="justify-between sm:justify-between">
          {canDelete ? (
            <Button variant="ghost" size="lg" className="text-destructive hover:text-destructive" onClick={() => onDelete(expense)}>
              Delete expense
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap justify-end gap-2.5">
            {canReject(expense) ? (
              <Button variant="destructive" size="lg" onClick={() => onReject(expense)}>
                <X className="size-4" />
                Reject
              </Button>
            ) : null}
            {canApprove(expense) ? (
              <Button size="lg" onClick={() => onApprove(expense)}>
                <Check className="size-4" />
                Approve
              </Button>
            ) : (
              <Button variant="outline" size="lg" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
