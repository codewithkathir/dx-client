'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Download, Paperclip, Plus, Search } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
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
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { BillDetailDialog } from '@/features/payables/components/BillDetailDialog';
import { BillFormDialog } from '@/features/payables/components/BillForm';
import { BillStatusBadge } from '@/features/payables/components/BillStatusBadge';
import { BILL_STATUS_FILTER_OPTIONS, BILL_STATUS_LABELS } from '@/features/payables/constants/payable.constants';
import { useBills, usePayableMutations, usePayablesSummary } from '@/features/payables/hooks/usePayables';
import { payableService } from '@/features/payables/services/payable.service';
import { useSupplierOptions } from '@/features/suppliers/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Bill, BillListFilters, BillStatus, PayeeType } from '@/types/finance.types';
import { downloadCsv } from '@/utils/csv.utils';
import { addDaysIso, formatMoney, todayIso } from '@/utils/money.utils';

export type DueWindow = '' | 'week' | 'month';

/** "Due this week" = today … +6 days; "this month" = today … last day of the month. */
export function dueRange(window: DueWindow): { dueFrom?: string; dueTo?: string } {
  if (!window) return {};
  const today = todayIso();
  if (window === 'week') return { dueFrom: today, dueTo: addDaysIso(today, 6) };
  const [y, m] = today.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { dueFrom: today, dueTo: last };
}

const TABS: Array<{ value: PayeeType | ''; label: string }> = [
  { value: '', label: 'All bills' },
  { value: 'supplier', label: 'Supplier bills' },
  { value: 'employee', label: 'Reimbursements' },
];

export function PayablesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const billParam = Number(searchParams.get('bill'));
  const openBillId = Number.isInteger(billParam) && billParam > 0 ? billParam : null;
  const initialStatus = searchParams.get('status') as BillStatus | null;

  const [filters, setFilters] = useState<BillListFilters>({
    page: 1,
    limit: 10,
    order: 'desc',
    ...(initialStatus && initialStatus in BILL_STATUS_LABELS ? { status: initialStatus } : {}),
  });
  const [dueWindow, setDueWindow] = useState<DueWindow>('');
  const [searchInput, setSearchInput] = useState('');
  const [formBill, setFormBill] = useState<Bill | 'new' | null>(searchParams.get('new') === '1' ? 'new' : null);
  const [payOnOpen, setPayOnOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }
  const listFilters: BillListFilters & { dueFrom?: string; dueTo?: string } = {
    ...filters,
    search: debouncedSearch || undefined,
    ...dueRange(dueWindow),
  };

  const { data, isLoading, isError, error, refetch } = useBills(listFilters);
  const { data: summary, isLoading: summaryLoading } = usePayablesSummary();
  const { data: suppliers = [] } = useSupplierOptions();
  const { createBill, updateBill } = usePayableMutations();
  const items = data?.items ?? [];

  const setOpenBill = (id: number | null, withPayment = false) => {
    setPayOnOpen(withPayment);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('new');
    if (id) params.set('bill', String(id));
    else params.delete('bill');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const editing = formBill !== null && formBill !== 'new' ? formBill : undefined;
  const closeForm = () => {
    setFormBill(null);
    if (searchParams.get('new')) setOpenBill(null);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: Bill[] = [];
      for (let page = 1; ; page++) {
        const res = await payableService.list({ ...listFilters, page, limit: 100 });
        all.push(...res.items);
        if (page >= res.meta.totalPages) break;
      }
      downloadCsv('dx-payables.csv', [
        ['Bill no.', 'Payee', 'Payee type', 'Bill date', 'Due date', 'Status', 'Net (AED)', 'VAT (AED)', 'Total (AED)', 'Paid (AED)', 'Balance (AED)', 'Description'],
        ...all.map((b) => [
          b.billNo,
          b.payeeName,
          b.payeeType,
          b.billDate,
          b.dueDate,
          b.isOverdue ? 'Overdue' : BILL_STATUS_LABELS[b.status],
          b.subtotalAmount,
          b.vatAmount,
          b.totalAmount,
          b.amountPaid,
          b.balance,
          b.description,
        ]),
      ]);
    } finally {
      setExporting(false);
    }
  };

  const rowAction = (bill: Bill) => {
    const canPay = ['open', 'partially_paid'].includes(bill.status) && bill.balance > 0;
    if (canPay) {
      return (
        <Button variant="outline" size="sm" onClick={() => setOpenBill(bill.id, true)}>
          Record payment
        </Button>
      );
    }
    if (bill.status === 'draft' && bill.source === 'manual') {
      return (
        <Button variant="ghost" size="sm" onClick={() => setFormBill(bill)}>
          Edit
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpenBill(bill.id)}>
        View
      </Button>
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_PAYABLES}
        description={PAGE_DESCRIPTIONS.ADMIN_PAYABLES}
        actions={
          <>
            <Button loading={exporting} variant="outline" size="lg" onClick={exportCsv} disabled={exporting || items.length === 0}>
              <Download className="size-4" />
              Export
            </Button>
            <Button size="lg" onClick={() => setFormBill('new')}>
              <Plus className="size-4" />
              New bill
            </Button>
          </>
        }
      />

      <MoneySummaryCards
        summary={summary && { ...summary, settledThisMonth: summary.paidThisMonth }}
        isLoading={summaryLoading}
        documentNoun="bill"
        settledLabel="Paid this month"
      />

      <Card className="gap-0 py-0" aria-label="Bills">
        <div role="tablist" aria-label="Bill type" className="flex flex-wrap gap-1 border-b border-border px-4">
          {TABS.map((tab) => {
            const selected = (filters.payeeType ?? '') === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    payeeType: tab.value,
                    supplierId: tab.value === 'employee' ? undefined : f.supplierId,
                    page: 1,
                  }))
                }
                className={cn(
                  'h-12 px-3 text-sm transition-colors',
                  selected ? 'font-semibold text-primary shadow-[inset_0_-2px_0_var(--primary)]' : 'font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[1_1_260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-9" type="search" placeholder="Search bill no., payee or description" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search bills" />
          </div>
          <Select
            className="w-auto flex-[0_1_200px]"
            aria-label="Status"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as BillStatus | '', page: 1 }))}
          >
            {BILL_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            className="w-auto flex-[0_1_200px]"
            aria-label="Due date"
            value={dueWindow}
            onChange={(e) => {
              setDueWindow(e.target.value as DueWindow);
              setFilters((f) => ({ ...f, page: 1 }));
            }}
          >
            <option value="">Due: any time</option>
            <option value="week">Due this week</option>
            <option value="month">Due this month</option>
          </Select>
          {filters.payeeType !== 'employee' ? (
            <Select
              className="w-auto flex-[0_1_220px]"
              aria-label="Supplier"
              value={filters.supplierId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, supplierId: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
            >
              <option value="">All suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </Select>
          ) : null}
        </div>

        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel title="Failed to load bills" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No bills" description="Record a supplier bill, or approve an employee expense to create a reimbursement." />
            </div>
          ) : (
            <Table className="min-w-[860px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Bill no.</TableHead>
                  <TableHead>Supplier / employee</TableHead>
                  <TableHead>Bill date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <button type="button" onClick={() => setOpenBill(bill.id)} className="font-semibold text-primary hover:underline">
                        {bill.billNo}
                      </button>
                      {bill.attachment ? (
                        <Paperclip className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Has document" />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {bill.payeeName ?? '—'}
                      {bill.payeeType === 'employee' ? <span className="text-muted-foreground"> · reimbursement</span> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatExpenseDate(bill.billDate)}</TableCell>
                    <TableCell className={cn('whitespace-nowrap', bill.isOverdue && 'font-medium text-destructive')}>
                      {formatExpenseDate(bill.dueDate)}
                    </TableCell>
                    <TableCell>
                      <BillStatusBadge bill={bill} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(bill.totalAmount)}</TableCell>
                    <TableCell className={cn('text-right tabular-nums', bill.balance > 0 && bill.status !== 'cancelled' ? 'font-semibold' : 'text-muted-foreground')}>
                      {bill.status === 'draft' || bill.status === 'cancelled' ? '—' : formatMoney(bill.balance)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{rowAction(bill)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {data?.meta && items.length > 0 ? (
          <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        ) : null}
      </Card>

      <BillDetailDialog
        key={`${openBillId}-${payOnOpen}`}
        billId={openBillId}
        startWithPayment={payOnOpen}
        onClose={() => setOpenBill(null)}
        onEdit={(bill) => {
          setOpenBill(null);
          setFormBill(bill);
        }}
      />

      <BillFormDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formBill !== null}
        bill={editing}
        isSubmitting={createBill.isPending || updateBill.isPending}
        onSubmit={(payload) => {
          if (editing) {
            updateBill.mutate({ id: editing.id, payload }, { onSuccess: closeForm });
          } else {
            createBill.mutate(payload, {
              onSuccess: (bill) => {
                setFormBill(null);
                setOpenBill(bill.id);
              },
            });
          }
        }}
        onClose={closeForm}
      />
    </section>
  );
}
