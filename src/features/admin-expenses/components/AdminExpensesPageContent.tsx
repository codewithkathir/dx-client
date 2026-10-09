'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

import { UI_PANEL } from '@/constants/ui.constants';
import { EmptyState } from '@/components/feedback/EmptyState';
import { cn } from '@/lib/utils';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  ExpenseStageBadge,
  getExpenseStage,
} from '@/features/expenses/components/ExpenseStageBadge';
import { AdminExpenseSummaryCards } from '@/features/admin-expenses/components/AdminExpenseSummaryCards';
import {
  ADMIN_EXPENSE_DEFAULT_PAGE_SIZE,
  ADMIN_EXPENSE_STATUS_OPTIONS,
} from '@/features/admin-expenses/constants/admin-expense.constants';
import { useAdminExpenseMutations } from '@/features/admin-expenses/hooks/useAdminExpenseMutations';
import {
  useAdminCategoryDropdown,
  useAdminEmployeeOptions,
  useAdminExpenseSummary,
  useAdminExpenses,
  useAdminPaymentMethodDropdown,
  useAdminWhomDropdown,
} from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { useAdminSubCategoryLabelMap } from '@/features/admin-expenses/hooks/useAdminSubCategoryLabelMap';
import { TablePagination } from '@/components/tables/TablePagination';
import { ExpenseAttachmentPreview } from '@/features/expenses/components/ExpenseAttachmentPreview';
import {
  formatExpenseAmount,
  formatExpenseDate,
  isImageSupportFile,
} from '@/features/expenses/utils/expense.utils';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { API_ENDPOINTS } from '@/services/endpoints';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useDebounce } from '@/hooks/useDebounce';
import type {
  AdminExpenseListFilters,
  AdminExpenseStatus,
  AdminExpenseSummaryFilters,
  Expense,
} from '@/types/expense.types';

type DialogMode = 'view' | 'delete' | null;
type Decision = { expense: Expense; action: 'approve' | 'reject' };

/** Pending claims can be approved; anything not yet paid or rejected can be rejected. */
const canApprove = (e: Expense) => e.employeeStatus === 'pending' && e.adminStatus === 'pending';
const canReject = (e: Expense) =>
  e.employeeStatus !== 'rejected' &&
  e.adminStatus !== 'rejected' &&
  e.adminStatus !== 'paid' &&
  (e.reimbursement?.amountPaid ?? 0) === 0;

const defaultFilters: AdminExpenseListFilters = {
  page: 1,
  limit: ADMIN_EXPENSE_DEFAULT_PAGE_SIZE,
  order: 'desc',
};

const adminSupportFileUrl = (id: number) =>
  API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.SUPPORT_FILE(id);

export function AdminExpensesPageContent() {
  const [filters, setFilters] = useState<AdminExpenseListFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Expense | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  const debouncedSearch = useDebounce(searchInput);

  const summaryFilters: AdminExpenseSummaryFilters = useMemo(
    () => ({
      employeeId: filters.employeeId,
      status: filters.status,
      categoryId: filters.categoryId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [
      filters.employeeId,
      filters.status,
      filters.categoryId,
      filters.dateFrom,
      filters.dateTo,
    ],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminExpenses(filters);
  const { data: summary, isLoading: summaryLoading } =
    useAdminExpenseSummary(summaryFilters);
  const { approveExpense, rejectExpense, deleteExpense } = useAdminExpenseMutations();
  const deciding = approveExpense.isPending || rejectExpense.isPending;

  const { data: categories = [] } = useAdminCategoryDropdown();
  const { data: whomOptions = [] } = useAdminWhomDropdown();
  const { data: paymentMethods = [] } = useAdminPaymentMethodDropdown();
  const { data: employeeData } = useAdminEmployeeOptions();

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const subCategoryMap = useAdminSubCategoryLabelMap(categoryIds);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const whomMap = useMemo(
    () => Object.fromEntries(whomOptions.map((w) => [w.id, w.empName])),
    [whomOptions],
  );
  const paymentMap = useMemo(
    () => Object.fromEntries(paymentMethods.map((p) => [p.id, p.name])),
    [paymentMethods],
  );
  const employeeMap = useMemo(() => {
    const employees = employeeData?.items ?? [];
    return Object.fromEntries(
      employees.map((e) => [e.id, e.empName]),
    );
  }, [employeeData]);

  const items = data?.items ?? [];
  const meta = data?.meta;
  const employees = employeeData?.items ?? [];

  // Apply the debounced search and go back to page 1 when it changes.
  const [appliedSearch, setAppliedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== appliedSearch) {
    setAppliedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, search: debouncedSearch || undefined, page: 1 }));
  }

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  const openView = (expense: Expense) => {
    setActive(expense);
    setDialogMode('view');
  };

  const openDelete = (expense: Expense) => {
    setActive(expense);
    setDialogMode('delete');
  };

  const confirmDecision = () => {
    if (!decision) return;
    const mutation = decision.action === 'approve' ? approveExpense : rejectExpense;
    mutation.mutate(decision.expense.id, {
      onSuccess: (updated) => {
        setDecision(null);
        if (dialogMode === 'view') setActive(updated);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_EXPENSES}
        description={PAGE_DESCRIPTIONS.ADMIN_EXPENSES}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <AdminExpenseSummaryCards summary={summary} isLoading={summaryLoading} />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search expenses"
            />
          </div>
          <Select
            value={filters.employeeId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                employeeId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
          >
            <option value="">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.empName}
              </option>
            ))}
          </Select>
          <Select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value as AdminExpenseStatus) || undefined,
                page: 1,
              }))
            }
          >
            {ADMIN_EXPENSE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.categoryId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                categoryId: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <DateRangePicker
            placeholder="Expense date range"
            value={{ from: filters.dateFrom, to: filters.dateTo }}
            onChange={({ from, to }) =>
              setFilters((f) => {
                const next = { ...f, page: 1 };
                if (from) next.dateFrom = from;
                else delete next.dateFrom;
                if (to) next.dateTo = to;
                else delete next.dateTo;
                return next;
              })
            }
          />
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load expenses"
              message={
                typeof error === 'object' && error !== null && 'message' in error
                  ? String((error as { message: string }).message)
                  : 'Something went wrong'
              }
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
              title="No expenses found"
              description="Try adjusting filters or check back when employees submit claims."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub category</TableHead>
                    <TableHead>Whom</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatExpenseDate(expense.date)}</TableCell>
                      <TableCell className="font-medium">
                        {employeeMap[expense.employeeId] ?? `#${expense.employeeId}`}
                      </TableCell>
                      <TableCell>{formatExpenseAmount(expense.amount)}</TableCell>
                      <TableCell>
                        {categoryMap[expense.categoryId] ?? expense.categoryId}
                      </TableCell>
                      <TableCell>
                        {subCategoryMap[expense.subCategoryId] ?? expense.subCategoryId}
                      </TableCell>
                      <TableCell>{whomMap[expense.whom] ?? expense.whom}</TableCell>
                      <TableCell>
                        {paymentMap[expense.paymentMethodId] ?? expense.paymentMethodId}
                      </TableCell>
                      <TableCell>
                        {expense.supportFile ? (
                          isImageSupportFile(expense.supportFile) ? (
                            <ExpenseAttachmentPreview
                              expenseId={expense.id}
                              supportFile={expense.supportFile}
                              supportFileUrl={adminSupportFileUrl}
                              variant="thumbnail"
                            />
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto px-0"
                              onClick={() => openView(expense)}
                            >
                              View
                            </Button>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ExpenseStageBadge expense={expense} showBillLink />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View"
                            onClick={() => openView(expense)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {canApprove(expense) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Approve"
                              title="Approve – creates a reimbursement bill"
                              disabled={deciding}
                              onClick={() => setDecision({ expense, action: 'approve' })}
                            >
                              <CheckCircle2 className="size-4 text-emerald-600" />
                            </Button>
                          ) : null}
                          {canReject(expense) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Reject"
                              title="Reject"
                              disabled={deciding}
                              onClick={() => setDecision({ expense, action: 'reject' })}
                            >
                              <XCircle className="size-4 text-destructive" />
                            </Button>
                          ) : null}
                          {/* Money already paid out can't be deleted with the claim. */}
                          {(expense.reimbursement?.amountPaid ?? 0) === 0 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => openDelete(expense)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {meta ? (
              <TablePagination
                meta={meta}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            ) : null}
          </>
        )}
      </Card>

      <Dialog open={dialogMode === 'view'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent onClose={closeDialog} className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Expense details</DialogTitle>
            <DialogDescription>
              Approve to create a reimbursement bill; it is paid from Payables.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {active ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Employee</dt>
                  <dd className="font-medium">
                    {employeeMap[active.employeeId] ?? `#${active.employeeId}`}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{formatExpenseDate(active.date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-medium">{formatExpenseAmount(active.amount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Whom</dt>
                  <dd>{whomMap[active.whom] ?? active.whom}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>{categoryMap[active.categoryId] ?? active.categoryId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sub category</dt>
                  <dd>{subCategoryMap[active.subCategoryId] ?? active.subCategoryId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <ExpenseStageBadge expense={active} showBillLink />
                  </dd>
                </div>
                {active.reimbursement && active.reimbursement.status !== 'cancelled' ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Reimbursed</dt>
                    <dd>
                      {formatExpenseAmount(active.reimbursement.amountPaid)} of{' '}
                      {formatExpenseAmount(active.reimbursement.totalAmount)}
                      {active.reimbursement.lastPaymentDate
                        ? ` · last paid ${formatExpenseDate(active.reimbursement.lastPaymentDate)}`
                        : ''}
                    </dd>
                  </div>
                ) : null}
                {active.description ? (
                  <div>
                    <dt className="text-muted-foreground">Description</dt>
                    <dd className="mt-1">{active.description}</dd>
                  </div>
                ) : null}
                {active.supportFile ? (
                  <div>
                    <dt className="mb-2 text-muted-foreground">Attachment</dt>
                    <dd>
                      <ExpenseAttachmentPreview
                        expenseId={active.id}
                        supportFile={active.supportFile}
                        supportFileUrl={adminSupportFileUrl}
                        variant="detail"
                      />
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </DialogBody>
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {active && canReject(active) ? (
              <Button
                variant="outline"
                disabled={deciding}
                onClick={() => setDecision({ expense: active, action: 'reject' })}
              >
                <XCircle className="size-4" />
                Reject
              </Button>
            ) : null}
            {active && canApprove(active) ? (
              <Button disabled={deciding} onClick={() => setDecision({ expense: active, action: 'approve' })}>
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete expense"
        description={
          active?.reimbursement && active.reimbursement.status !== 'cancelled'
            ? `Delete this expense claim? Its unpaid reimbursement ${active.reimbursement.billNo} will be cancelled.`
            : 'Soft-delete this expense claim? Employees will no longer see it in their list.'
        }
        confirmText="Delete"
        variant="destructive"
        loading={deleteExpense.isPending}
        onConfirm={() =>
          active &&
          deleteExpense.mutate(active.id, {
            onSuccess: closeDialog,
          })
        }
        onCancel={closeDialog}
      />

      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => !open && setDecision(null)}
        title={decision?.action === 'approve' ? 'Approve expense' : 'Reject expense'}
        description={
          decision
            ? decision.action === 'approve'
              ? `Approve ${formatExpenseAmount(decision.expense.amount)}? A reimbursement bill will be created in Payables, where the payment is recorded.`
              : `Reject this ${formatExpenseAmount(decision.expense.amount)} claim?${
                  getExpenseStage(decision.expense).label.startsWith('Approved')
                    ? ' Its unpaid reimbursement bill will be cancelled.'
                    : ''
                }`
            : ''
        }
        confirmText={decision?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={decision?.action === 'reject' ? 'destructive' : undefined}
        loading={deciding}
        onConfirm={confirmDecision}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}
