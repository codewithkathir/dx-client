'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ban, Info, Pen, Receipt, Send, Trash, Wallet } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { MoneyStrip } from '@/components/shared/MoneyStrip';
import { SettlementDialog } from '@/components/shared/SettlementDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { BillAttachmentSection } from '@/features/payables/components/BillAttachmentSection';
import { BillStatusBadge } from '@/features/payables/components/BillStatusBadge';
import { useBill, usePayableMutations } from '@/features/payables/hooks/usePayables';
import type { BillDetail, Payment } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

interface BillDetailDialogProps {
  billId: number | null;
  onClose: () => void;
  onEdit: (bill: BillDetail) => void;
  /** Open straight into "Record payment" (row action on the list). */
  startWithPayment?: boolean;
}

type Confirm = { kind: 'cancel' | 'delete' } | { kind: 'deletePayment'; payment: Payment } | null;

function Detail({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'sm:col-span-2' : undefined}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Design "ModalBillDetail". */
export function BillDetailDialog({ billId, onClose, onEdit, startWithPayment = false }: BillDetailDialogProps) {
  const { data: bill, isLoading } = useBill(billId);
  const { issueBill, cancelBill, deleteBill, recordPayment, deletePayment } = usePayableMutations();
  const [paying, setPaying] = useState(startWithPayment);
  const [confirm, setConfirm] = useState<Confirm>(null);

  if (billId === null) return null;

  const close = () => {
    setPaying(false);
    setConfirm(null);
    onClose();
  };

  const isManual = bill?.source === 'manual';
  const hasPayments = (bill?.payments.length ?? 0) > 0;
  const canPay = Boolean(bill && ['open', 'partially_paid'].includes(bill.status) && bill.balance > 0);
  const canEdit = Boolean(bill && isManual && ['draft', 'open'].includes(bill.status) && bill.amountPaid === 0);
  const canCancel = Boolean(bill && isManual && !['cancelled', 'paid'].includes(bill.status) && !hasPayments);
  const canDelete = Boolean(bill && isManual && ['draft', 'cancelled'].includes(bill.status) && !hasPayments);

  return (
    <>
      <Dialog open={!paying} onOpenChange={(open) => !open && close()}>
        <DialogContent onClose={close} className="max-w-[800px]">
          <DialogIconHeader
            icon={Receipt}
            title={bill ? `Bill ${bill.billNo}` : 'Bill'}
            badge={bill ? <BillStatusBadge bill={bill} /> : null}
            description={
              bill
                ? bill.payeeType === 'employee'
                  ? `Reimbursement to ${bill.payeeName ?? 'employee'}${bill.employeeCode ? ` (${bill.employeeCode})` : ''}`
                  : `Owed to ${bill.payeeName ?? 'supplier'}`
                : 'Loading…'
            }
          />
          <DialogBody className="flex flex-col gap-5">
            {isLoading || !bill ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                {bill.source === 'expense' && bill.expenseId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-brand-blue-50 px-3.5 py-3 text-sm text-brand-blue-hover">
                    <Info className="size-[18px] shrink-0" aria-hidden />
                    <span className="flex-1">
                      <strong className="font-semibold">Source:</strong> created from expense claim #{bill.expenseId} when it was
                      approved on {formatExpenseDate(bill.billDate)}.
                    </span>
                    <Link href={`${ADMIN_ROUTES.EXPENSES}?claim=${bill.expenseId}`} className="font-semibold hover:underline">
                      View claim
                    </Link>
                  </div>
                ) : null}

                <MoneyStrip
                  cells={[
                    { label: 'Net', value: bill.subtotalAmount },
                    { label: `VAT ${bill.vatRate}%`, value: bill.vatAmount },
                    { label: 'Total', value: bill.totalAmount },
                    { label: 'Paid', value: bill.amountPaid, tone: bill.amountPaid > 0 ? 'settled' : undefined },
                    { label: 'Balance', value: bill.balance, tone: 'balance' },
                  ]}
                />

                <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-3">
                  <Detail label="Bill date">{formatExpenseDate(bill.billDate)}</Detail>
                  <Detail label="Due date">
                    <span className={bill.isOverdue ? 'text-destructive' : undefined}>{formatExpenseDate(bill.dueDate)}</span>
                  </Detail>
                  <Detail label="Category">{bill.categoryName ?? '—'}</Detail>
                  <Detail label="Description" span2>
                    {bill.description ?? '—'}
                  </Detail>
                  <Detail label="Notes">{bill.notes ?? '—'}</Detail>
                </dl>

                <BillAttachmentSection bill={bill} />

                <section aria-labelledby="bill-payments">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 id="bill-payments" className="text-sm font-semibold">
                      Payments
                    </h3>
                  </div>
                  {hasPayments ? (
                    <div className="overflow-hidden rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead className="w-12">
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bill.payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{formatExpenseDate(payment.paymentDate)}</TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">{formatMoney(payment.amount)}</TableCell>
                              <TableCell>{payment.paymentMethodName ?? '—'}</TableCell>
                              <TableCell className="text-muted-foreground">{payment.reference ?? '—'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  aria-label={`Delete payment of ${formatMoney(payment.amount)}`}
                                  onClick={() => setConfirm({ kind: 'deletePayment', payment })}
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-7 text-center">
                      <Wallet className="size-8 text-muted-foreground" aria-hidden />
                      <p className="text-sm font-medium">No payments yet</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.status === 'draft'
                          ? 'Issue the bill to start recording payments.'
                          : bill.payeeType === 'employee'
                            ? 'Record a payment when you pay the employee back.'
                            : 'Record a payment when you pay the supplier.'}
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
          </DialogBody>
          <DialogFooter className="justify-between sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {canCancel ? (
                <Button variant="destructive" size="lg" onClick={() => setConfirm({ kind: 'cancel' })}>
                  <Ban className="size-4" />
                  Cancel bill
                </Button>
              ) : null}
              {canDelete ? (
                <Button variant="ghost" size="lg" className="text-destructive hover:text-destructive" onClick={() => setConfirm({ kind: 'delete' })}>
                  Delete bill
                </Button>
              ) : null}
              {bill?.source === 'expense' && bill.status !== 'cancelled' && !hasPayments ? (
                <span className="self-center text-xs text-muted-foreground">To cancel, reject the expense claim.</span>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {canEdit && bill ? (
                <Button variant="outline" size="lg" onClick={() => onEdit(bill)}>
                  <Pen className="size-4" />
                  Edit
                </Button>
              ) : null}
              {bill?.status === 'draft' ? (
                <Button size="lg" onClick={() => issueBill.mutate(bill.id)} disabled={issueBill.isPending}>
                  <Send className="size-4" />
                  Issue bill
                </Button>
              ) : canPay ? (
                <Button size="lg" onClick={() => setPaying(true)}>
                  Record payment
                </Button>
              ) : (
                <Button variant="outline" size="lg" onClick={close}>
                  Close
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {bill ? (
        <SettlementDialog
          open={paying && canPay}
          kind="payment"
          documentLabel={`${bill.billNo} · ${bill.payeeName ?? ''}`}
          total={bill.totalAmount}
          balance={bill.balance}
          dueDate={bill.dueDate}
          minDate={bill.billDate}
          isSubmitting={recordPayment.isPending}
          onSubmit={(v) =>
            recordPayment.mutate(
              {
                id: bill.id,
                payload: { paymentDate: v.date, amount: v.amount, paymentMethodId: v.paymentMethodId, reference: v.reference, notes: v.notes },
              },
              { onSuccess: () => setPaying(false) },
            )
          }
          onClose={() => (startWithPayment ? close() : setPaying(false))}
        />
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        icon={confirm?.kind === 'cancel' ? Ban : undefined}
        title={confirm?.kind === 'deletePayment' ? 'Delete payment' : confirm?.kind === 'cancel' ? 'Cancel bill' : 'Delete bill'}
        description={
          confirm?.kind === 'deletePayment'
            ? `Delete the payment of ${formatMoney(confirm.payment.amount)}? The bill's balance goes back up.`
            : confirm?.kind === 'cancel'
              ? `Cancel bill ${bill?.billNo ?? ''}? It will no longer count as owed.`
              : `Delete bill ${bill?.billNo ?? ''}? It will be removed from the list.`
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
