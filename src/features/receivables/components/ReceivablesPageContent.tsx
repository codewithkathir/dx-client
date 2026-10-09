'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Eye, Plus, Search } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { MoneySummaryCards } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { UI_PANEL } from '@/constants/ui.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { useCustomerOptions } from '@/features/customers/hooks/useCustomers';
import { InvoiceDetailDialog } from '@/features/receivables/components/InvoiceDetailDialog';
import { InvoiceForm } from '@/features/receivables/components/InvoiceForm';
import { InvoiceStatusBadge } from '@/features/receivables/components/InvoiceStatusBadge';
import { INVOICE_STATUS_FILTER_OPTIONS } from '@/features/receivables/constants/receivable.constants';
import {
  useInvoices,
  useReceivableMutations,
  useReceivablesSummary,
} from '@/features/receivables/hooks/useReceivables';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Invoice, InvoiceListFilters, InvoiceStatus } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

export function ReceivablesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // ?invoice=<id> opens an invoice directly (shareable link).
  const invoiceParam = Number(searchParams.get('invoice'));
  const openInvoiceId = Number.isInteger(invoiceParam) && invoiceParam > 0 ? invoiceParam : null;

  const [filters, setFilters] = useState<InvoiceListFilters>({ page: 1, limit: 10, order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [formInvoice, setFormInvoice] = useState<Invoice | 'new' | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useInvoices({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: summary, isLoading: summaryLoading } = useReceivablesSummary();
  const { data: customers = [] } = useCustomerOptions();
  const { createInvoice, updateInvoice } = useReceivableMutations();
  const items = data?.items ?? [];

  const setOpenInvoice = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('invoice', String(id));
    else params.delete('invoice');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const editing = formInvoice !== null && formInvoice !== 'new' ? formInvoice : undefined;
  const closeForm = () => setFormInvoice(null);

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_RECEIVABLES}
        description={PAGE_DESCRIPTIONS.ADMIN_RECEIVABLES}
        actions={
          <Button onClick={() => setFormInvoice('new')}>
            <Plus className="size-4" />
            New invoice
          </Button>
        }
      />

      <MoneySummaryCards
        summary={summary && { ...summary, settledThisMonth: summary.receivedThisMonth }}
        isLoading={summaryLoading}
        documentNoun="invoice"
        settledLabel="Received this month"
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Invoice no., customer, PO ref…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search invoices"
            />
          </div>
          <Select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as InvoiceStatus | '', page: 1 }))}
            aria-label="Filter by status"
          >
            {INVOICE_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.customerId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                customerId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            aria-label="Filter by customer"
          >
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
          <DateRangePicker
            placeholder="Invoice date range"
            value={{ from: filters.dateFrom, to: filters.dateTo }}
            onChange={({ from, to }) => setFilters((f) => ({ ...f, dateFrom: from, dateTo: to, page: 1 }))}
          />
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load invoices"
              message={error?.message ?? 'Something went wrong'}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No invoices"
              description="Raise an invoice to a customer. Add customers first if the list is empty."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer" onClick={() => setOpenInvoice(invoice.id)}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNo}</div>
                      {invoice.poReference ? (
                        <div className="text-xs text-muted-foreground">PO {invoice.poReference}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div>{invoice.customerName}</div>
                      {invoice.description ? (
                        <div className="max-w-56 truncate text-xs text-muted-foreground">{invoice.description}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatExpenseDate(invoice.invoiceDate)}</TableCell>
                    <TableCell className={cn('whitespace-nowrap', invoice.isOverdue && 'font-medium text-destructive')}>
                      {formatExpenseDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(invoice.totalAmount)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {invoice.balance > 0 && invoice.status !== 'cancelled' ? formatMoney(invoice.balance) : '—'}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge invoice={invoice} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`View invoice ${invoice.invoiceNo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenInvoice(invoice.id);
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data?.meta ? (
              <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
            ) : null}
          </>
        )}
      </Card>

      <InvoiceDetailDialog
        invoiceId={openInvoiceId}
        onClose={() => setOpenInvoice(null)}
        onEdit={(invoice) => {
          setOpenInvoice(null);
          setFormInvoice(invoice);
        }}
      />

      <Dialog open={formInvoice !== null} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent onClose={closeForm} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit invoice ${editing.invoiceNo}` : 'New invoice'}</DialogTitle>
            <DialogDescription>
              VAT and the total are calculated for you. The customer&apos;s TRN is printed on the tax invoice.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <InvoiceForm
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
              onCancel={closeForm}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
