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
import { Badge } from '@/components/ui/badge';
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
import { BillDetailDialog } from '@/features/payables/components/BillDetailDialog';
import { BillForm } from '@/features/payables/components/BillForm';
import { BillStatusBadge } from '@/features/payables/components/BillStatusBadge';
import {
  BILL_STATUS_FILTER_OPTIONS,
  PAYEE_TYPE_FILTER_OPTIONS,
} from '@/features/payables/constants/payable.constants';
import {
  useBills,
  usePayableMutations,
  usePayablesSummary,
} from '@/features/payables/hooks/usePayables';
import { useSupplierOptions } from '@/features/suppliers/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Bill, BillListFilters, BillStatus, PayeeType } from '@/types/finance.types';
import { formatMoney } from '@/utils/money.utils';

export function PayablesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // ?bill=<id> opens a bill directly (used by links from the expenses page).
  const billParam = Number(searchParams.get('bill'));
  const openBillId = Number.isInteger(billParam) && billParam > 0 ? billParam : null;

  const [filters, setFilters] = useState<BillListFilters>({ page: 1, limit: 10, order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [formBill, setFormBill] = useState<Bill | 'new' | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useBills({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: summary, isLoading: summaryLoading } = usePayablesSummary();
  const { data: suppliers = [] } = useSupplierOptions();
  const { createBill, updateBill } = usePayableMutations();
  const items = data?.items ?? [];

  const setOpenBill = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('bill', String(id));
    else params.delete('bill');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const editing = formBill !== null && formBill !== 'new' ? formBill : undefined;
  const closeForm = () => setFormBill(null);

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_PAYABLES}
        description={PAGE_DESCRIPTIONS.ADMIN_PAYABLES}
        actions={
          <Button onClick={() => setFormBill('new')}>
            <Plus className="size-4" />
            New bill
          </Button>
        }
      />

      <MoneySummaryCards
        summary={summary && { ...summary, settledThisMonth: summary.paidThisMonth }}
        isLoading={summaryLoading}
        documentNoun="bill"
        settledLabel="Paid this month"
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Bill no., payee, description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search bills"
            />
          </div>
          <Select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as BillStatus | '', page: 1 }))}
            aria-label="Filter by status"
          >
            {BILL_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.payeeType ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                payeeType: e.target.value as PayeeType | '',
                supplierId: e.target.value === 'employee' ? undefined : f.supplierId,
                page: 1,
              }))
            }
            aria-label="Filter by payee type"
          >
            {PAYEE_TYPE_FILTER_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.supplierId ?? ''}
            disabled={filters.payeeType === 'employee'}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                supplierId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            aria-label="Filter by supplier"
          >
            <option value="">All suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </Select>
          <DateRangePicker
            placeholder="Bill date range"
            value={{ from: filters.dateFrom, to: filters.dateTo }}
            onChange={({ from, to }) => setFilters((f) => ({ ...f, dateFrom: from, dateTo: to, page: 1 }))}
          />
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load bills"
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
              title="No bills"
              description="Record a supplier bill, or approve an employee expense to create a reimbursement."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Bill date</TableHead>
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
                {items.map((bill) => (
                  <TableRow key={bill.id} className="cursor-pointer" onClick={() => setOpenBill(bill.id)}>
                    <TableCell>
                      <div className="font-medium">{bill.billNo}</div>
                      {bill.source === 'expense' ? (
                        <Badge variant="outline" className="mt-1">Reimbursement</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div>{bill.payeeName ?? '—'}</div>
                      {bill.description ? (
                        <div className="max-w-56 truncate text-xs text-muted-foreground">{bill.description}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatExpenseDate(bill.billDate)}</TableCell>
                    <TableCell className={cn('whitespace-nowrap', bill.isOverdue && 'font-medium text-destructive')}>
                      {formatExpenseDate(bill.dueDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(bill.totalAmount)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {bill.balance > 0 ? formatMoney(bill.balance) : '—'}
                    </TableCell>
                    <TableCell>
                      <BillStatusBadge bill={bill} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`View bill ${bill.billNo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenBill(bill.id);
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

      <BillDetailDialog
        billId={openBillId}
        onClose={() => setOpenBill(null)}
        onEdit={(bill) => {
          setOpenBill(null);
          setFormBill(bill);
        }}
      />

      <Dialog open={formBill !== null} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent onClose={closeForm} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit bill ${editing.billNo}` : 'New supplier bill'}</DialogTitle>
            <DialogDescription>
              Enter the supplier&apos;s invoice details. VAT and the total are calculated for you.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <BillForm
              bill={editing}
              isSubmitting={createBill.isPending || updateBill.isPending}
              onSubmit={(payload) => {
                if (editing) {
                  updateBill.mutate({ id: editing.id, payload }, { onSuccess: closeForm });
                } else {
                  createBill.mutate(payload, {
                    onSuccess: (bill) => {
                      closeForm();
                      setOpenBill(bill.id);
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
