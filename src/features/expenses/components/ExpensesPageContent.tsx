'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';
import { ExpenseAttachmentPreview } from '@/features/expenses/components/ExpenseAttachmentPreview';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { ExpenseStatusBadge } from '@/features/expenses/components/ExpenseStatusBadge';
import { EXPENSE_DEFAULT_PAGE_SIZE } from '@/features/expenses/constants/expense.constants';
import { useExpenseMutations } from '@/features/expenses/hooks/useExpenseMutations';
import {
  useCategoryDropdown,
  useExpenses,
  usePaymentMethodDropdown,
  useWhomDropdown,
} from '@/features/expenses/hooks/useExpenseQueries';
import { useSubCategoryLabelMap } from '@/features/expenses/hooks/useSubCategoryLabelMap';
import type { ExpenseFormValues } from '@/features/expenses/schemas/expense.schema';
import {
  formatExpenseAmount,
  formatExpenseDate,
  isImageSupportFile,
} from '@/features/expenses/utils/expense.utils';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { UI_PANEL } from '@/constants/ui.constants';
import { cn } from '@/lib/utils';
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
import type { CreateExpensePayload, Expense, ExpenseListFilters } from '@/types/expense.types';

type DialogMode = 'create' | 'edit' | 'view' | 'delete' | null;

const defaultFilters: ExpenseListFilters = {
  page: 1,
  limit: EXPENSE_DEFAULT_PAGE_SIZE,
  order: 'desc',
};

function toCreatePayload(values: ExpenseFormValues): CreateExpensePayload {
  return {
    date: values.date,
    amount: values.amount,
    whom: values.whom,
    categoryId: values.categoryId,
    subCategoryId: values.subCategoryId,
    subSubCategoryId: values.subSubCategoryId ?? null,
    description: values.description || null,
    paymentMethodId: values.paymentMethodId,
  };
}

export function ExpensesPageContent() {
  const [filters, setFilters] = useState<ExpenseListFilters>(defaultFilters);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Expense | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useExpenses(filters);
  const { createExpense, updateExpense, deleteExpense } = useExpenseMutations();

  const { data: categories = [] } = useCategoryDropdown();
  const { data: whomOptions = [] } = useWhomDropdown();
  const { data: paymentMethods = [] } = usePaymentMethodDropdown();

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const subCategoryMap = useSubCategoryLabelMap(categoryIds);

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

  const items = data?.items ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1 }));
  }, [filters.categoryId, filters.dateFrom, filters.dateTo]);

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  const openCreate = () => {
    setActive(null);
    setDialogMode('create');
  };

  const openEdit = (expense: Expense) => {
    setActive(expense);
    setDialogMode('edit');
  };

  const openView = (expense: Expense) => {
    setActive(expense);
    setDialogMode('view');
  };

  const openDelete = (expense: Expense) => {
    setActive(expense);
    setDialogMode('delete');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.USER_EXPENSES}
        description={PAGE_DESCRIPTIONS.USER_EXPENSES}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            New expense
          </Button>
        }
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-3">
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
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No expenses yet"
              description="Submit your first expense claim using the button above."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub category</TableHead>
                    <TableHead>Whom</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatExpenseDate(expense.date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatExpenseAmount(expense.amount)}
                      </TableCell>
                      <TableCell>{categoryMap[expense.categoryId] ?? expense.categoryId}</TableCell>
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
                              variant="thumbnail"
                            />
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto px-0"
                              onClick={() => openView(expense)}
                            >
                              View file
                            </Button>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ExpenseStatusBadge status={expense.employeeStatus} />
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
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => openEdit(expense)}
                          >
                            <Pencil className="size-4" />
                          </Button>
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

      <Dialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent onClose={closeDialog} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Submit expense' : 'Edit expense'}
            </DialogTitle>
            <DialogDescription>
              Status is set to pending automatically and cannot be changed here.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ExpenseForm
              expense={active ?? undefined}
              isSubmitting={createExpense.isPending || updateExpense.isPending}
              onSubmit={(values, file) => {
                const payload = toCreatePayload(values);
                if (dialogMode === 'create') {
                  createExpense.mutate(
                    { payload, supportFile: file },
                    { onSuccess: closeDialog },
                  );
                } else if (active) {
                  updateExpense.mutate(
                    { id: active.id, payload, supportFile: file },
                    { onSuccess: closeDialog },
                  );
                }
              }}
              onCancel={closeDialog}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'view'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent onClose={closeDialog} className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Expense details</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {active ? (
              <dl className="space-y-3 text-sm">
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
                    <ExpenseStatusBadge status={active.employeeStatus} />
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
                        variant="detail"
                      />
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete expense"
        description="Remove this expense claim? This action cannot be undone."
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
    </div>
  );
}
