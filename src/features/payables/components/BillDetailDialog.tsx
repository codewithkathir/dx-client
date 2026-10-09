'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ban, CreditCard, Pencil, Send, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { BillStatusBadge } from '@/features/payables/components/BillStatusBadge';
import { PaymentForm } from '@/features/payables/components/PaymentForm';
import { useBill, usePayableMutations } from '@/features/payables/hooks/usePayables';
import type { BillDetail, Payment } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

interface BillDetailDialogProps {
  billId: number | null;
  onClose: () => void;
  onEdit: (bill: BillDetail) => void;
}

type Confirm = { kind: 'cancel' | 'delete' } | { kind: 'deletePayment'; payment: Payment } | null;

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function BillDetailDialog({ billId, onClose, onEdit }: BillDetailDialogProps) {
  const { data: bill, isLoading } = useBill(billId);
  const { issueBill, cancelBill, deleteBill, recordPayment, deletePayment } = usePayableMutations();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const close = () => {
    setShowPaymentForm(false);
    setConfirm(null);
    onClose();
  };

  const isManual = bill?.source === 'manual';
  const hasPayments = (bill?.payments.length ?? 0) > 0;
  const canPay = bill && ['open', 'partially_paid'].includes(bill.status) && bill.balance > 0;
  const canEdit = bill && isManual && ['draft', 'open'].includes(bill.status) && bill.amountPaid === 0;
  const canCancel = bill && isManual && !['cancelled', 'paid'].includes(bill.status) && !hasPayments;
  const canDelete = bill && isManual && ['draft', 'cancelled'].includes(bill.status) && !hasPayments;

  return (
    <>
      <Dialog open={billId !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent onClose={close} className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {bill ? `Bill ${bill.billNo}` : 'Bill'}
              {bill ? <BillStatusBadge bill={bill} /> : null}
            </DialogTitle>
            <DialogDescription>
              {bill
                ? bill.payeeType === 'employee'
                  ? `Reimbursement owed to ${bill.payeeName ?? 'employee'}${bill.employeeCode ? ` (${bill.employeeCode})` : ''}`
                  : `Owed to ${bill.payeeName ?? 'supplier'}`
                : 'Loading…'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-6">
            {isLoading || !bill ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <Detail label="Bill date">{formatExpenseDate(bill.billDate)}</Detail>
                  <Detail label="Due date">
                    <span className={bill.isOverdue ? 'font-medium text-destructive' : undefined}>
                      {formatExpenseDate(bill.dueDate)}
                    </span>
                  </Detail>
                  <Detail label="Category">{bill.categoryName ?? '—'}</Detail>
                  <Detail label="Description">{bill.description ?? '—'}</Detail>
                  <Detail label="Source">
                    {bill.source === 'expense' && bill.expenseId ? (
                      <Link className="text-primary underline-offset-4 hover:underline" href={ADMIN_ROUTES.EXPENSES}>
                        Expense #{bill.expenseId}
                      </Link>
                    ) : (
                      'Manual bill'
                    )}
                  </Detail>
                  {bill.notes ? <Detail label="Notes">{bill.notes}</Detail> : null}
                </dl>

                <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-5">
                  <Detail label="Net">{formatMoney(bill.subtotalAmount)}</Detail>
                  <Detail label={`VAT ${bill.vatRate}%`}>{formatMoney(bill.vatAmount)}</Detail>
                  <Detail label="Total">
                    <span className="font-semibold">{formatMoney(bill.totalAmount)}</span>
                  </Detail>
                  <Detail label="Paid">{formatMoney(bill.amountPaid)}</Detail>
                  <Detail label="Balance">
                    <span className={bill.balance > 0 ? 'font-semibold text-destructive' : 'font-semibold'}>
                      {formatMoney(bill.balance)}
                    </span>
                  </Detail>
                </dl>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium">Payments</h3>
                    {canPay && !showPaymentForm ? (
                      <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                        <CreditCard className="size-4" />
                        Record payment
                      </Button>
                    ) : null}
                  </div>

                  {showPaymentForm && canPay ? (
                    <div className="rounded-lg border border-border p-4">
                      <PaymentForm
                        balance={bill.balance}
                        billDate={bill.billDate}
                        isSubmitting={recordPayment.isPending}
                        onSubmit={(payload) =>
                          recordPayment.mutate(
                            { id: bill.id, payload },
                            { onSuccess: () => setShowPaymentForm(false) },
                          )
                        }
                        onCancel={() => setShowPaymentForm(false)}
                      />
                    </div>
                  ) : null}

                  {hasPayments ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatExpenseDate(payment.paymentDate)}</TableCell>
                            <TableCell>{payment.paymentMethodName ?? '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{payment.reference ?? '—'}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoney(payment.amount)}</TableCell>
                            <TableCell className="text-right">
                              {bill.status !== 'cancelled' ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Delete payment of ${formatMoney(payment.amount)}`}
                                  onClick={() => setConfirm({ kind: 'deletePayment', payment })}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {bill.status === 'draft' ? 'Issue the bill to start recording payments.' : 'No payments yet.'}
                    </p>
                  )}
                </section>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  {bill.source === 'expense' && bill.status !== 'cancelled' ? (
                    <Badge variant="secondary" className="mr-auto self-center">
                      {hasPayments
                        ? 'Reimbursement — delete payments here to reverse it'
                        : 'Reimbursement — reject the expense to cancel it'}
                    </Badge>
                  ) : null}
                  {canDelete ? (
                    <Button variant="ghost" onClick={() => setConfirm({ kind: 'delete' })}>
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button variant="outline" onClick={() => setConfirm({ kind: 'cancel' })}>
                      <Ban className="size-4" />
                      Cancel bill
                    </Button>
                  ) : null}
                  {canEdit ? (
                    <Button variant="outline" onClick={() => onEdit(bill)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  ) : null}
                  {bill.status === 'draft' ? (
                    <Button onClick={() => issueBill.mutate(bill.id)} disabled={issueBill.isPending}>
                      <Send className="size-4" />
                      Issue bill
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.kind === 'deletePayment' ? 'Delete payment' : confirm?.kind === 'cancel' ? 'Cancel bill' : 'Delete bill'
        }
        description={
          confirm?.kind === 'deletePayment'
            ? `Delete the payment of ${formatMoney(confirm.payment.amount)}? The bill's balance goes back up.`
            : confirm?.kind === 'cancel'
              ? 'Cancel this bill? It will no longer count as owed.'
              : 'Delete this bill permanently from the list?'
        }
        confirmText={confirm?.kind === 'cancel' ? 'Cancel bill' : 'Delete'}
        variant="destructive"
        loading={cancelBill.isPending || deleteBill.isPending || deletePayment.isPending}
        onConfirm={() => {
          if (!bill || !confirm) return;
          if (confirm.kind === 'deletePayment') {
            deletePayment.mutate({ id: bill.id, paymentId: confirm.payment.id }, { onSuccess: () => setConfirm(null) });
          } else if (confirm.kind === 'cancel') {
            cancelBill.mutate(bill.id, { onSuccess: () => setConfirm(null) });
          } else {
            deleteBill.mutate(bill.id, { onSuccess: close });
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
