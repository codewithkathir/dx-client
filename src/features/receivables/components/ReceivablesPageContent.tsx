'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Download, Plus, Search } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { MoneySummaryCards } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { useCustomerOptions } from '@/features/customers/hooks/useCustomers';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { InvoiceDetailDialog } from '@/features/receivables/components/InvoiceDetailDialog';
import { InvoiceFormDialog } from '@/features/receivables/components/InvoiceForm';
import { InvoiceStatusBadge } from '@/features/receivables/components/InvoiceStatusBadge';
import { INVOICE_STATUS_FILTER_OPTIONS, INVOICE_STATUS_LABELS } from '@/features/receivables/constants/receivable.constants';
import { useInvoices, useReceivableMutations, useReceivablesSummary } from '@/features/receivables/hooks/useReceivables';
import { receivableService } from '@/features/receivables/services/receivable.service';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Invoice, InvoiceListFilters, InvoiceStatus } from '@/types/finance.types';
import { downloadCsv } from '@/utils/csv.utils';
import { formatMoney } from '@/utils/money.utils';

export function ReceivablesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const invoiceParam = Number(searchParams.get('invoice'));
  const openInvoiceId = Number.isInteger(invoiceParam) && invoiceParam > 0 ? invoiceParam : null;
  const initialStatus = searchParams.get('status') as InvoiceStatus | null;

  const [filters, setFilters] = useState<InvoiceListFilters>({
    page: 1,
    limit: 10,
    order: 'desc',
    ...(initialStatus && initialStatus in INVOICE_STATUS_LABELS ? { status: initialStatus } : {}),
  });
  const [searchInput, setSearchInput] = useState('');
  const [formInvoice, setFormInvoice] = useState<Invoice | 'new' | null>(searchParams.get('new') === '1' ? 'new' : null);
  const [receiveOnOpen, setReceiveOnOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }
  const listFilters: InvoiceListFilters = { ...filters, search: debouncedSearch || undefined };

  const { data, isLoading, isError, error, refetch } = useInvoices(listFilters);
  const { data: summary, isLoading: summaryLoading } = useReceivablesSummary();
  const { data: customers = [] } = useCustomerOptions();
  const { createInvoice, updateInvoice, downloadPdf } = useReceivableMutations();
  const items = data?.items ?? [];

  const setOpenInvoice = (id: number | null, withReceipt = false) => {
    setReceiveOnOpen(withReceipt);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('new');
    if (id) params.set('invoice', String(id));
    else params.delete('invoice');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const editing = formInvoice !== null && formInvoice !== 'new' ? formInvoice : undefined;
  const closeForm = () => setFormInvoice(null);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: Invoice[] = [];
      for (let page = 1; ; page++) {
        const res = await receivableService.list({ ...listFilters, page, limit: 100 });
        all.push(...res.items);
        if (page >= res.meta.totalPages) break;
      }
      downloadCsv('dx-receivables.csv', [
        ['Invoice no.', 'Customer', 'Customer TRN', 'PO reference', 'Invoice date', 'Due date', 'Status', 'Net (AED)', 'VAT (AED)', 'Total (AED)', 'Received (AED)', 'Balance (AED)'],
        ...all.map((i) => [
          i.invoiceNo,
          i.customerName,
          i.customerTrn,
          i.poReference,
          i.invoiceDate,
          i.dueDate,
          i.isOverdue ? 'Overdue' : INVOICE_STATUS_LABELS[i.status],
          i.subtotalAmount,
          i.vatAmount,
          i.totalAmount,
          i.amountReceived,
          i.status === 'cancelled' ? 0 : i.balance,
        ]),
      ]);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title={PAGE_TITLES.ADMIN_RECEIVABLES}
        description={PAGE_DESCRIPTIONS.ADMIN_RECEIVABLES}
        actions={
          <>
            <Button loading={exporting} variant="outline" size="lg" onClick={exportCsv} disabled={exporting || items.length === 0}>
              <Download className="size-4" />
              Export
            </Button>
            <Button size="lg" onClick={() => setFormInvoice('new')}>
              <Plus className="size-4" />
              New invoice
            </Button>
          </>
        }
      />

      <MoneySummaryCards
        summary={summary && { ...summary, settledThisMonth: summary.receivedThisMonth }}
        isLoading={summaryLoading}
        documentNoun="invoice"
        settledLabel="Received this month"
        highlightSettled
      />

      <Card className="gap-0 py-0" aria-label="Invoices">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-9" type="search" placeholder="Invoice no., customer, PO ref…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search invoices" />
          </div>
          <Select
            className="w-auto flex-[1_1_180px]"
            aria-label="Filter by customer"
            value={filters.customerId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
          >
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
          <Select
            className="w-auto flex-[0_1_170px]"
            aria-label="Filter by status"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as InvoiceStatus | '', page: 1 }))}
          >
            {INVOICE_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <DateRangePicker
            className="flex-[1_1_200px]"
            placeholder="Invoice date range"
            value={{ from: filters.dateFrom, to: filters.dateTo }}
            onChange={({ from, to }) => setFilters((f) => ({ ...f, dateFrom: from, dateTo: to, page: 1 }))}
          />
        </div>

        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel title="Failed to load invoices" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No invoices" description="Raise an invoice to a customer. Add customers first if the list is empty." />
            </div>
          ) : (
            <Table className="min-w-[960px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((invoice) => {
                  const canReceive = ['sent', 'partially_paid'].includes(invoice.status) && invoice.balance > 0;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <button type="button" onClick={() => setOpenInvoice(invoice.id)} className="font-semibold text-primary hover:underline">
                          {invoice.invoiceNo}
                        </button>
                        <div className="text-xs text-muted-foreground">{invoice.poReference ?? '—'}</div>
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatExpenseDate(invoice.invoiceDate)}</TableCell>
                      <TableCell className={cn('whitespace-nowrap', invoice.isOverdue && 'font-medium text-destructive')}>
                        {formatExpenseDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge invoice={invoice} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(invoice.totalAmount)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {invoice.status === 'draft' || invoice.status === 'cancelled' ? '—' : formatMoney(invoice.balance)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {canReceive ? (
                          <Button variant="outline" size="sm" onClick={() => setOpenInvoice(invoice.id, true)}>
                            Record receipt
                          </Button>
                        ) : invoice.status === 'draft' ? (
                          <Button variant="ghost" size="sm" onClick={() => setFormInvoice(invoice)}>
                            Edit
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setOpenInvoice(invoice.id)}>
                            View
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download tax invoice ${invoice.invoiceNo} as PDF`}
                          title="Download PDF"
                          disabled={downloadPdf.isPending}
                          onClick={() => downloadPdf.mutate({ id: invoice.id, invoiceNo: invoice.invoiceNo })}
                        >
                          <Download className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        {data?.meta && items.length > 0 ? (
          <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        ) : null}
      </Card>

      <InvoiceDetailDialog
        key={`${openInvoiceId}-${receiveOnOpen}`}
        invoiceId={openInvoiceId}
        startWithReceipt={receiveOnOpen}
        onClose={() => setOpenInvoice(null)}
        onEdit={(invoice) => {
          setOpenInvoice(null);
          setFormInvoice(invoice);
        }}
      />

      <InvoiceFormDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formInvoice !== null}
        invoice={editing}
        isSubmitting={createInvoice.isPending || updateInvoice.isPending}
        onSubmit={(payload) => {
          if (editing) {
            updateInvoice.mutate({ id: editing.id, payload }, { onSuccess: closeForm });
          } else {
            createInvoice.mutate(payload, {
              onSuccess: (invoice) => {
                closeForm();
                setOpenInvoice(invoice.id);
              },
            });
          }
        }}
        onClose={closeForm}
      />
    </section>
  );
}
