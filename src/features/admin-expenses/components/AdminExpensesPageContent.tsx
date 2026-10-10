'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, CircleCheck, CircleX, Clock4, Download, Eye, Paperclip, Receipt, Search, X } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { friendlyFileName } from '@/components/shared/file-blob';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { ExpenseDecisionDialogs, type ExpenseDecision } from '@/features/admin-expenses/components/ExpenseDecisionDialogs';
import { ExpenseDetailDialog } from '@/features/admin-expenses/components/ExpenseDetailDialog';
import { ADMIN_EXPENSE_DEFAULT_PAGE_SIZE } from '@/features/admin-expenses/constants/admin-expense.constants';
import { useAdminExpenseMutations } from '@/features/admin-expenses/hooks/useAdminExpenseMutations';
import {
  useAdminExpense,
  useAdminExpenseSummary,
  useAdminExpenses,
} from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { useExpenseLookups } from '@/features/admin-expenses/hooks/useExpenseLookups';
import { adminExpenseService } from '@/features/admin-expenses/services/admin-expense.service';
import { canApprove, canReject } from '@/features/admin-expenses/utils/expense-decisions';
import { ExpenseStageBadge, getExpenseStage } from '@/features/expenses/components/ExpenseStageBadge';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { AdminExpenseListFilters, AdminExpenseSummaryFilters, Expense, ExpenseStage } from '@/types/expense.types';
import { downloadCsv } from '@/utils/csv.utils';
import { formatMoney } from '@/utils/money.utils';
import { API_ENDPOINTS } from '@/services/endpoints';

const STAGE_OPTIONS: Array<{ value: ExpenseStage | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'approved', label: 'Approved · awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

const fileName = (path: string) => path.split('/').pop() ?? 'Receipt';

export function AdminExpensesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // ?claim=<id> opens that claim's details (links from Payables and search).
  const claimParam = Number(searchParams.get('claim'));
  const { data: linkedClaim } = useAdminExpense(Number.isInteger(claimParam) && claimParam > 0 ? claimParam : undefined);
  const initialStage = searchParams.get('stage') as ExpenseStage | null;
  const [filters, setFilters] = useState<AdminExpenseListFilters>({
    page: 1,
    limit: ADMIN_EXPENSE_DEFAULT_PAGE_SIZE,
    order: 'desc',
    ...(initialStage && STAGE_OPTIONS.some((o) => o.value === initialStage) ? { stage: initialStage } : {}),
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [viewing, setViewing] = useState<Expense | null>(null);
  // Receipt opened straight from the paperclip in the table.
  const [previewing, setPreviewing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [decision, setDecision] = useState<ExpenseDecision | null>(null);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }
  const listFilters: AdminExpenseListFilters = { ...filters, search: debouncedSearch || undefined };

  const summaryFilters: AdminExpenseSummaryFilters = useMemo(
    () => ({ employeeId: filters.employeeId, categoryId: filters.categoryId, dateFrom: filters.dateFrom, dateTo: filters.dateTo }),
    [filters.employeeId, filters.categoryId, filters.dateFrom, filters.dateTo],
  );
  const { data, isLoading, isError, error, refetch } = useAdminExpenses(listFilters);
  const { data: summary, isLoading: summaryLoading } = useAdminExpenseSummary(summaryFilters);
  const { deleteExpense } = useAdminExpenseMutations();
  const lookups = useExpenseLookups();
  const items = data?.items ?? [];
  const shownClaim = viewing ?? linkedClaim ?? null;
  const closeClaim = () => {
    setViewing(null);
    if (searchParams.get('claim')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('claim');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  const byStatus = (status: 'pending' | 'paid' | 'rejected') =>
    summary?.byStatus.find((s) => s.adminStatus === status) ?? { count: 0, amount: 0 };
  const employeeName = (e: Expense) => lookups.employeeMap[e.employeeId] ?? `Employee #${e.employeeId}`;
  const decide = (expense: Expense, action: 'approve' | 'reject') =>
    setDecision({ expense, action, employeeName: employeeName(expense) });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: Expense[] = [];
      for (let page = 1; ; page++) {
        const res = await adminExpenseService.list({ ...listFilters, page, limit: 100 });
        all.push(...res.items);
        if (page >= res.meta.totalPages) break;
      }
      downloadCsv('dx-expense-claims.csv', [
        ['Claim', 'Date', 'Employee', 'Whom', 'Category', 'Sub category', 'Amount (AED)', 'Payment', 'Status', 'Reimbursement', 'Description'],
        ...all.map((e) => [
          e.id,
          e.date,
          employeeName(e),
          lookups.whomMap[e.whom] ?? '',
          lookups.categoryMap[e.categoryId] ?? '',
          lookups.subCategoryMap[e.subCategoryId] ?? '',
          e.amount,
          lookups.paymentMap[e.paymentMethodId] ?? '',
          getExpenseStage(e).label,
          e.reimbursement?.billNo ?? '',
          e.description ?? '',
        ]),
      ]);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title={PAGE_TITLES.ADMIN_EXPENSES}
        description={PAGE_DESCRIPTIONS.ADMIN_EXPENSES}
        actions={
          <>
            <Button variant="outline" size="lg" render={<Link href={ADMIN_ROUTES.EXPENSES_REVIEW} />}>
              Review one by one
            </Button>
            <Button loading={exporting} variant="outline" size="lg" onClick={exportCsv} disabled={exporting || items.length === 0}>
              <Download className="size-4" />
              Export
            </Button>
          </>
        }
      />

      {summaryLoading ? (
        <StatCardsSkeleton />
      ) : summary ? (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total claims" value={String(summary.totalCount)} hint={formatMoney(summary.totalAmount)} icon={Receipt} tone="outstanding" iconColor="blue" iconTile />
          <StatCard label="Pending" value={String(byStatus('pending').count)} hint={formatMoney(byStatus('pending').amount)} icon={Clock4} tone="pending" iconTile />
          <StatCard label="Paid" value={String(byStatus('paid').count)} hint={formatMoney(byStatus('paid').amount)} icon={CircleCheck} tone="settled" iconTile />
          <StatCard label="Rejected" value={String(byStatus('rejected').count)} hint={formatMoney(byStatus('rejected').amount)} icon={CircleX} tone="overdue" iconTile />
        </section>
      ) : null}

      <Card className="gap-0 py-0" aria-label="Expense claims">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-9" type="search" placeholder="Search description…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search expenses" />
          </div>
          <Select
            className="w-auto flex-[1_1_160px]"
            aria-label="Employee"
            value={filters.employeeId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
          >
            <option value="">All employees</option>
            {lookups.employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.empName}
              </option>
            ))}
          </Select>
          <Select
            className="w-auto flex-[1_1_160px]"
            aria-label="Category"
            value={filters.categoryId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
          >
            <option value="">All categories</option>
            {lookups.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <DateRangePicker
            className="flex-[1_1_200px]"
            placeholder="Expense date range"
            value={{ from: filters.dateFrom, to: filters.dateTo }}
            onChange={({ from, to }) => setFilters((f) => ({ ...f, dateFrom: from, dateTo: to, page: 1 }))}
          />
          <Select
            className="w-auto flex-[0_1_200px]"
            aria-label="Status"
            value={filters.stage ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, stage: (e.target.value as ExpenseStage) || undefined, page: 1 }))}
          >
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel title="Failed to load expenses" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No expense claims" description="Claims employees submit will appear here. Try clearing the filters." />
            </div>
          ) : (
            <Table className="min-w-[1080px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Whom</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sub category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">{formatExpenseDate(expense.date)}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{employeeName(expense)}</TableCell>
                    <TableCell className="whitespace-nowrap">{lookups.whomMap[expense.whom] ?? '—'}</TableCell>
                    <TableCell>{lookups.categoryMap[expense.categoryId] ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{lookups.subCategoryMap[expense.subCategoryId] ?? '—'}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatMoney(expense.amount)}</TableCell>
                    <TableCell className="whitespace-nowrap">{lookups.paymentMap[expense.paymentMethodId] ?? '—'}</TableCell>
                    <TableCell>
                      {expense.supportFile ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary"
                          aria-label={`View attachment ${fileName(expense.supportFile)}`}
                          title={fileName(expense.supportFile)}
                          onClick={() => setPreviewing(expense)}
                        >
                          <Paperclip className="size-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ExpenseStageBadge expense={expense} showBillLink />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewing(expense)}>
                        <Eye className="size-4" />
                      </Button>
                      {canApprove(expense) ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Approve – creates a reimbursement bill"
                          title="Approve"
                          className="text-status-success-ink hover:text-status-success-ink"
                          onClick={() => decide(expense, 'approve')}
                        >
                          <Check className="size-4" />
                        </Button>
                      ) : null}
                      {canReject(expense) ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Reject"
                          title="Reject"
                          className="text-destructive hover:text-destructive"
                          onClick={() => decide(expense, 'reject')}
                        >
                          <X className="size-4" />
                        </Button>
                      ) : null}
                    </TableCell>
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

      <ExpenseDetailDialog
        expense={shownClaim}
        lookups={lookups}
        onClose={closeClaim}
        onApprove={(e) => decide(e, 'approve')}
        onReject={(e) => decide(e, 'reject')}
        onDelete={(e) => setDeleting(e)}
        canApprove={canApprove}
        canReject={canReject}
      />

      <ExpenseDecisionDialogs
        decision={decision}
        onClose={() => setDecision(null)}
        onDone={(updated) => setViewing((current) => (current && current.id === updated.id ? updated : current))}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete expense"
        description={
          deleting?.reimbursement && deleting.reimbursement.status !== 'cancelled'
            ? `Delete this ${formatMoney(deleting.amount)} claim? Its unpaid reimbursement ${deleting.reimbursement.billNo} will be cancelled.`
            : `Delete this ${deleting ? formatMoney(deleting.amount) : ''} claim? The employee will no longer see it.`
        }
        confirmText="Delete"
        variant="destructive"
        loading={deleteExpense.isPending}
        onConfirm={() =>
          deleting &&
          deleteExpense.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null);
              closeClaim();
            },
          })
        }
        onCancel={() => setDeleting(null)}
      />
      <AttachmentViewer
        open={Boolean(previewing?.supportFile)}
        onClose={() => setPreviewing(null)}
        src={previewing ? API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.SUPPORT_FILE(previewing.id) : undefined}
        fileName={previewing?.supportFile ? friendlyFileName(fileName(previewing.supportFile), `receipt-${previewing.id}`) : ''}
      />
    </section>
  );
}
