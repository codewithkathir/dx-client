'use client';

import { useState } from 'react';
import { Ban, Download, HandCoins, Pencil, Send, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { PaymentForm } from '@/features/payables/components/PaymentForm';
import { InvoiceStatusBadge } from '@/features/receivables/components/InvoiceStatusBadge';
import { useInvoice, useReceivableMutations } from '@/features/receivables/hooks/useReceivables';
import type { InvoiceDetail, Receipt } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

interface InvoiceDetailDialogProps {
  invoiceId: number | null;
  onClose: () => void;
  onEdit: (invoice: InvoiceDetail) => void;
}

type Confirm = { kind: 'cancel' } | { kind: 'deleteReceipt'; receipt: Receipt } | null;

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function InvoiceDetailDialog({ invoiceId, onClose, onEdit }: InvoiceDetailDialogProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { sendInvoice, cancelInvoice, recordReceipt, deleteReceipt, downloadPdf } = useReceivableMutations();
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const close = () => {
    setShowReceiptForm(false);
    setConfirm(null);
    onClose();
  };

  const hasReceipts = (invoice?.receipts.length ?? 0) > 0;
  const canReceive = invoice && ['sent', 'partially_paid'].includes(invoice.status) && invoice.balance > 0;
  const canCancel = invoice && invoice.status !== 'cancelled' && !hasReceipts;

  return (
    <>
      <Dialog open={invoiceId !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent onClose={close} className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {invoice ? `Invoice ${invoice.invoiceNo}` : 'Invoice'}
              {invoice ? <InvoiceStatusBadge invoice={invoice} /> : null}
            </DialogTitle>
            <DialogDescription>
              {invoice ? `Billed to ${invoice.customerName}` : 'Loading…'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-6">
            {isLoading || !invoice ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <Detail label="Invoice date">{formatExpenseDate(invoice.invoiceDate)}</Detail>
                  <Detail label="Due date">
                    <span className={invoice.isOverdue ? 'font-medium text-destructive' : undefined}>
                      {formatExpenseDate(invoice.dueDate)}
                    </span>
                  </Detail>
                  <Detail label="Customer TRN">{invoice.customerTrn ?? '—'}</Detail>
                  <Detail label="PO reference">{invoice.poReference ?? '—'}</Detail>
                  <div className="sm:col-span-2">
                    <Detail label="Description">
                      <span className="whitespace-pre-line">{invoice.description ?? '—'}</span>
                    </Detail>
                  </div>
                </dl>

                <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-5">
                  <Detail label="Net">{formatMoney(invoice.subtotalAmount)}</Detail>
                  <Detail label={`VAT ${invoice.vatRate}%`}>{formatMoney(invoice.vatAmount)}</Detail>
                  <Detail label="Total">
                    <span className="font-semibold">{formatMoney(invoice.totalAmount)}</span>
                  </Detail>
                  <Detail label="Received">{formatMoney(invoice.amountReceived)}</Detail>
                  <Detail label="Balance">
                    <span className={invoice.balance > 0 ? 'font-semibold text-destructive' : 'font-semibold'}>
                      {formatMoney(invoice.balance)}
                    </span>
                  </Detail>
                </dl>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium">Receipts</h3>
                    {canReceive && !showReceiptForm ? (
                      <Button size="sm" onClick={() => setShowReceiptForm(true)}>
                        <HandCoins className="size-4" />
                        Record receipt
                      </Button>
                    ) : null}
                  </div>

                  {showReceiptForm && canReceive ? (
                    <div className="rounded-lg border border-border p-4">
                      <PaymentForm
                        balance={invoice.balance}
                        billDate={invoice.invoiceDate}
                        dateLabel="Date received"
                        submitLabel="Record receipt"
                        isSubmitting={recordReceipt.isPending}
                        onSubmit={({ paymentDate, ...rest }) =>
                          recordReceipt.mutate(
                            { id: invoice.id, payload: { receiptDate: paymentDate, ...rest } },
                            { onSuccess: () => setShowReceiptForm(false) },
                          )
                        }
                        onCancel={() => setShowReceiptForm(false)}
                      />
                    </div>
                  ) : null}

                  {hasReceipts ? (
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
                        {invoice.receipts.map((receipt) => (
                          <TableRow key={receipt.id}>
                            <TableCell>{formatExpenseDate(receipt.receiptDate)}</TableCell>
                            <TableCell>{receipt.paymentMethodName ?? '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{receipt.reference ?? '—'}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoney(receipt.amount)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Delete receipt of ${formatMoney(receipt.amount)}`}
                                onClick={() => setConfirm({ kind: 'deleteReceipt', receipt })}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {invoice.status === 'draft'
                        ? 'Mark the invoice as sent to start recording receipts.'
                        : 'No receipts yet.'}
                    </p>
                  )}
                </section>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  {canCancel ? (
                    <Button variant="ghost" onClick={() => setConfirm({ kind: 'cancel' })}>
                      <Ban className="size-4" />
                      Cancel invoice
                    </Button>
                  ) : null}
                  {invoice.status === 'draft' ? (
                    <Button variant="outline" onClick={() => onEdit(invoice)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={downloadPdf.isPending}
                    onClick={() => downloadPdf.mutate({ id: invoice.id, invoiceNo: invoice.invoiceNo })}
                  >
                    <Download className="size-4" />
                    {downloadPdf.isPending ? 'Preparing…' : 'Download PDF'}
                  </Button>
                  {invoice.status === 'draft' ? (
                    <Button onClick={() => sendInvoice.mutate(invoice.id)} disabled={sendInvoice.isPending}>
                      <Send className="size-4" />
                      Mark as sent
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
        title={confirm?.kind === 'deleteReceipt' ? 'Delete receipt' : 'Cancel invoice'}
        description={
          confirm?.kind === 'deleteReceipt'
            ? `Delete the receipt of ${formatMoney(confirm.receipt.amount)}? The invoice balance goes back up.`
            : 'Cancel this invoice? It keeps its number but no longer counts as owed.'
        }
        confirmText={confirm?.kind === 'deleteReceipt' ? 'Delete' : 'Cancel invoice'}
        variant="destructive"
        loading={cancelInvoice.isPending || deleteReceipt.isPending}
        onConfirm={() => {
          if (!invoice || !confirm) return;
          if (confirm.kind === 'deleteReceipt') {
            deleteReceipt.mutate({ id: invoice.id, receiptId: confirm.receipt.id }, { onSuccess: () => setConfirm(null) });
          } else {
            cancelInvoice.mutate(invoice.id, { onSuccess: () => setConfirm(null) });
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
