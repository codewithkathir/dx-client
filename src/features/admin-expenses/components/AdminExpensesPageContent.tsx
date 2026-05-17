'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { AdminExpenseStatusBadge } from '@/features/admin-expenses/components/AdminExpenseStatusBadge';
import { AdminExpenseSummaryCards } from '@/features/admin-expenses/components/AdminExpenseSummaryCards';
import {
  ADMIN_EXPENSE_DEFAULT_PAGE_SIZE,
  ADMIN_EXPENSE_STATUS_LABELS,
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
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';
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

type DialogMode = 'view' | 'delete' | 'status' | null;

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
  const [statusSelection, setStatusSelection] = useState<AdminExpenseStatus>('pending');
  const [statusConfirm, setStatusConfirm] = useState<{
    expense: Expense;
    adminStatus: AdminExpenseStatus;
  } | null>(null);

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
  const { updateStatus, deleteExpense } = useAdminExpenseMutations();

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

  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1 }));
  }, [
    filters.employeeId,
    filters.status,
    filters.categoryId,
    filters.dateFrom,
    filters.dateTo,
  ]);

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

  const openStatus = (expense: Expense) => {
    setActive(expense);
    setStatusSelection(expense.adminStatus);
    setDialogMode('status');
  };

  const requestStatusChange = (expense: Expense, adminStatus: AdminExpenseStatus) => {
    if (expense.adminStatus === adminStatus) return;
    setStatusConfirm({ expense, adminStatus });
  };

  const confirmStatusChange = () => {
    if (!statusConfirm) return;
    updateStatus.mutate(
      { id: statusConfirm.expense.id, adminStatus: statusConfirm.adminStatus },
      {
        onSuccess: () => {
          setStatusConfirm(null);
          if (dialogMode === 'status') closeDialog();
        },
      },
    );
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
                        <AdminExpenseStatusBadge status={expense.adminStatus} />
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
                          {expense.adminStatus !== 'paid' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Mark paid"
                              disabled={updateStatus.isPending}
                              onClick={() => requestStatusChange(expense, 'paid')}
                            >
                              <CheckCircle2 className="size-4 text-emerald-600" />
                            </Button>
                          ) : null}
                          {expense.adminStatus !== 'rejected' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Reject"
                              disabled={updateStatus.isPending}
                              onClick={() => requestStatusChange(expense, 'rejected')}
                            >
                              <XCircle className="size-4 text-destructive" />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => openDelete(expense)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {meta ? (
              <CatalogPagination
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
              Review claim details and update admin payment status.
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
                  <dt className="text-muted-foreground">Admin status</dt>
                  <dd>
                    <AdminExpenseStatusBadge status={active.adminStatus} />
                  </dd>
                </div>
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
            {active ? (
              <Button onClick={() => openStatus(active)}>Update status</Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'status'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <DialogTitle>Update expense status</DialogTitle>
            <DialogDescription>
              Set the admin payment status for this expense claim.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Select
              value={statusSelection}
              onChange={(e) => setStatusSelection(e.target.value as AdminExpenseStatus)}
            >
              {ADMIN_EXPENSE_STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              disabled={!active}
              onClick={() =>
                active && requestStatusChange(active, statusSelection)
              }
            >
              Save status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete expense"
        description="Soft-delete this expense claim? Employees will no longer see it in their list."
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
        open={statusConfirm !== null}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title="Update expense status"
        description={
          statusConfirm
            ? `Change status to "${ADMIN_EXPENSE_STATUS_LABELS[statusConfirm.adminStatus]}" for this expense?`
            : ''
        }
        confirmText="Update status"
        loading={updateStatus.isPending}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusConfirm(null)}
      />
    </div>
  );
}
