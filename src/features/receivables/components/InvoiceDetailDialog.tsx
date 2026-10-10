'use client';

import { useState } from 'react';
import { Ban, ChevronDown, Download, Eye, FileText, HandCoins, Pen, Plus, Send, Trash } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { FilePreview } from '@/components/shared/FilePreview';
import { MoneyStrip } from '@/components/shared/MoneyStrip';
import { SettlementDialog } from '@/components/shared/SettlementDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import { InvoiceStatusBadge } from '@/features/receivables/components/InvoiceStatusBadge';
import { useInvoice, useReceivableMutations } from '@/features/receivables/hooks/useReceivables';
import type { InvoiceDetail, Receipt } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

interface InvoiceDetailDialogProps {
  invoiceId: number | null;
  onClose: () => void;
  onEdit: (invoice: InvoiceDetail) => void;
  /** Open straight into "Record receipt" (row action on the list). */
  startWithReceipt?: boolean;
}

type Confirm = { kind: 'cancel' } | { kind: 'deleteReceipt'; receipt: Receipt } | null;

function Detail({ label, children, span2, mono }: { label: string; children: React.ReactNode; span2?: boolean; mono?: boolean }) {
  return (
    <div className={span2 ? 'sm:col-span-2' : undefined}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={mono ? 'mt-0.5 font-mono text-[13px] font-medium' : 'mt-0.5 text-sm font-medium'}>{children}</dd>
    </div>
  );
}

/** Design "ModalInvoiceDetail". */
export function InvoiceDetailDialog({ invoiceId, onClose, onEdit, startWithReceipt = false }: InvoiceDetailDialogProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { sendInvoice, cancelInvoice, recordReceipt, deleteReceipt, downloadPdf } = useReceivableMutations();
  const [receiving, setReceiving] = useState(startWithReceipt);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [showPdf, setShowPdf] = useState(false);

  if (invoiceId === null) return null;

  const close = () => {
    setReceiving(false);
    setConfirm(null);
    setShowPdf(false);
    onClose();
  };

  const hasReceipts = (invoice?.receipts.length ?? 0) > 0;
  const canReceive = Boolean(invoice && ['sent', 'partially_paid'].includes(invoice.status) && invoice.balance > 0);
  const canCancel = Boolean(invoice && invoice.status !== 'cancelled' && !hasReceipts);
  const pdfButton = invoice ? (
    <Button loading={downloadPdf.isPending} variant="outline" size="lg" disabled={downloadPdf.isPending} onClick={() => downloadPdf.mutate({ id: invoice.id, invoiceNo: invoice.invoiceNo })}>
      <Download className="size-4" />
      Tax invoice PDF
    </Button>
  ) : null;

  return (
    <>
      <Dialog open={!receiving} onOpenChange={(open) => !open && close()}>
        <DialogContent onClose={close} className="max-w-[800px]">
          <DialogIconHeader
            icon={FileText}
            tone="green"
            title={invoice ? `Invoice ${invoice.invoiceNo}` : 'Invoice'}
            badge={invoice ? <InvoiceStatusBadge invoice={invoice} /> : null}
            description={invoice ? `${invoice.customerName} · issued ${formatExpenseDate(invoice.invoiceDate)}` : 'Loading…'}
          />
          <DialogBody className="flex flex-col gap-5">
            {isLoading || !invoice ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <MoneyStrip
                  cells={[
                    { label: 'Net', value: invoice.subtotalAmount },
                    { label: `VAT ${invoice.vatRate}%`, value: invoice.vatAmount },
                    { label: 'Total', value: invoice.totalAmount },
                    { label: 'Received', value: invoice.amountReceived, tone: 'settled' },
                    { label: 'Balance', value: invoice.status === 'cancelled' ? 0 : invoice.balance, tone: 'balance' },
                  ]}
                />
                <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-3">
                  <Detail label="Customer TRN" mono>
                    {invoice.customerTrn ?? '—'}
                  </Detail>
                  <Detail label="Invoice date">{formatExpenseDate(invoice.invoiceDate)}</Detail>
                  <Detail label="Due date">
                    <span className={invoice.isOverdue ? 'text-destructive' : undefined}>{formatExpenseDate(invoice.dueDate)}</span>
                  </Detail>
                  <Detail label="PO reference">{invoice.poReference ?? '—'}</Detail>
                  <Detail label="Description" span2>
                    <span className="whitespace-pre-line">{invoice.description ?? '—'}</span>
                  </Detail>
                </dl>

                <section aria-labelledby="invoice-preview" className="flex flex-col gap-2">
                  <button
                    type="button"
                    id="invoice-preview"
                    aria-expanded={showPdf}
                    onClick={() => setShowPdf((v) => !v)}
                    className="flex items-center gap-2 self-start rounded-md text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Eye className="size-4" aria-hidden />
                    {showPdf ? 'Hide tax invoice preview' : 'Preview tax invoice'}
                    <ChevronDown className={cn('size-4 transition-transform', showPdf && 'rotate-180')} aria-hidden />
                  </button>
                  {showPdf ? (
                    <FilePreview
                      key={`${invoice.id}-${invoice.updatedAt}`}
                      src={API_ENDPOINTS.RECEIVABLES.PDF(invoice.id)}
                      fileName={`${invoice.invoiceNo}.pdf`}
                      contentType="application/pdf"
                      className="h-[min(60vh,520px)]"
                    />
                  ) : null}
                </section>

                <section aria-labelledby="invoice-receipts">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 id="invoice-receipts" className="text-sm font-semibold">
                      Receipts
                    </h3>
                    {canReceive ? (
                      <Button variant="outline" size="sm" onClick={() => setReceiving(true)}>
                        <Plus className="size-3.5" />
                        Record receipt
                      </Button>
                    ) : null}
                  </div>
                  {hasReceipts ? (
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
                          {invoice.receipts.map((receipt) => (
                            <TableRow key={receipt.id}>
                              <TableCell>{formatExpenseDate(receipt.receiptDate)}</TableCell>
                              <TableCell className="text-right font-semibold text-status-success-ink tabular-nums">{formatMoney(receipt.amount)}</TableCell>
                              <TableCell>{receipt.paymentMethodName ?? '—'}</TableCell>
                              <TableCell className="text-muted-foreground">{receipt.reference ?? '—'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  aria-label={`Delete receipt of ${formatMoney(receipt.amount)}`}
                                  onClick={() => setConfirm({ kind: 'deleteReceipt', receipt })}
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
                      <HandCoins className="size-8 text-muted-foreground" aria-hidden />
                      <p className="text-sm font-medium">No receipts yet</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.status === 'draft' ? 'Mark the invoice as sent to start recording receipts.' : 'Record money as the customer pays.'}
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
          </DialogBody>
          <DialogFooter className="justify-between sm:justify-between">
            <div>
              {canCancel ? (
                <Button variant="destructive" size="lg" onClick={() => setConfirm({ kind: 'cancel' })}>
                  <Ban className="size-4" />
                  Cancel invoice
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {invoice?.status === 'draft' ? (
                <Button variant="outline" size="lg" onClick={() => onEdit(invoice)}>
                  <Pen className="size-4" />
                  Edit
                </Button>
              ) : null}
              {pdfButton}
              {invoice?.status === 'draft' ? (
                <Button size="lg" onClick={() => sendInvoice.mutate(invoice.id)} disabled={sendInvoice.isPending}>
                  <Send className="size-4" />
                  Mark as sent
                </Button>
              ) : canReceive ? (
                <Button size="lg" onClick={() => setReceiving(true)}>
                  Record receipt
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoice ? (
        <SettlementDialog
          open={receiving && canReceive}
          kind="receipt"
          documentLabel={`${invoice.invoiceNo} · ${invoice.customerName}`}
          total={invoice.totalAmount}
          balance={invoice.balance}
          dueDate={invoice.dueDate}
          minDate={invoice.invoiceDate}
          isSubmitting={recordReceipt.isPending}
          onSubmit={(v) =>
            recordReceipt.mutate(
              {
                id: invoice.id,
                payload: { receiptDate: v.date, amount: v.amount, paymentMethodId: v.paymentMethodId, reference: v.reference, notes: v.notes },
              },
              { onSuccess: () => setReceiving(false) },
            )
          }
          onClose={() => (startWithReceipt ? close() : setReceiving(false))}
        />
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        icon={confirm?.kind === 'cancel' ? Ban : undefined}
        title={confirm?.kind === 'deleteReceipt' ? 'Delete receipt' : 'Cancel invoice'}
        description={
          confirm?.kind === 'deleteReceipt'
            ? `Delete the receipt of ${formatMoney(confirm.receipt.amount)}? The invoice balance goes back up.`
            : `Cancel invoice ${invoice?.invoiceNo ?? ''}? It keeps its number but no longer counts as owed.`
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
