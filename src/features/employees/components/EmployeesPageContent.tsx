'use client';

import { useEffect, useState } from 'react';
import {
  Download,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';

import { UI_PANEL } from '@/constants/ui.constants';
import { EmptyState } from '@/components/feedback/EmptyState';
import { cn } from '@/lib/utils';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { BulkActionBar } from '@/components/shared/BulkActionBar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
import { EmployeeAvatar } from '@/features/employees/components/EmployeeAvatar';
import { EmployeeDetailDialog } from '@/features/employees/components/EmployeeDetailDialog';
import { EmployeeForm } from '@/features/employees/components/EmployeeForm';
import { EMPLOYEE_STATUS_OPTIONS } from '@/features/employees/constants/employee.constants';
import { useEmployeeMutations } from '@/features/employees/hooks/useEmployeeMutations';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import type { EmployeeFormValues } from '@/features/employees/schemas/employee.schema';
import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from '@/features/employees/utils/employee.mappers';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import {
  clearEmployeeSelection,
  setEmployeeFilters,
  setSelectedEmployeeIds,
  toggleEmployeeSelection,
} from '@/store/employees/employees.slice';
import {
  selectEmployeeFilters,
  selectSelectedEmployeeIds,
} from '@/store/employees/employees.selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Employee, EmployeeStatus } from '@/types/employee.types';

type DialogMode = 'create' | 'edit' | 'view' | 'delete' | null;

export function EmployeesPageContent() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectEmployeeFilters);
  const selectedIds = useAppSelector(selectSelectedEmployeeIds);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<EmployeeStatus | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput);

  const { data, isLoading, isError, error, refetch, isFetching } = useEmployees();
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkStatusMutation,
    exportMutation,
  } = useEmployeeMutations();

  const employees = data?.items ?? [];
  const meta = data?.meta;

  useEffect(() => {
    dispatch(setEmployeeFilters({ search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, dispatch]);

  const allSelected =
    employees.length > 0 && employees.every((e) => selectedIds.includes(e.id));

  const openCreate = () => {
    setActiveEmployee(null);
    setDialogMode('create');
  };

  const openView = (employee: Employee) => {
    setActiveEmployee(employee);
    setDialogMode('view');
  };

  const openEdit = (employee: Employee) => {
    setActiveEmployee(employee);
    setDialogMode('edit');
  };

  const openDelete = (employee: Employee) => {
    setActiveEmployee(employee);
    setDialogMode('delete');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setActiveEmployee(null);
  };

  const handleCreate = (values: EmployeeFormValues, profilePhoto?: File | null) => {
    createMutation.mutate(
      { payload: formValuesToCreatePayload(values), profilePhoto },
      { onSuccess: closeDialog },
    );
  };

  const handleUpdate = (values: EmployeeFormValues, profilePhoto?: File | null) => {
    if (!activeEmployee) return;
    updateMutation.mutate(
      {
        id: activeEmployee.id,
        payload: formValuesToUpdatePayload(values),
        profilePhoto,
      },
      { onSuccess: closeDialog },
    );
  };

  const handleDelete = () => {
    if (!activeEmployee) return;
    deleteMutation.mutate(activeEmployee.id, { onSuccess: closeDialog });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteMutation.mutate(
      { ids: selectedIds },
      { onSuccess: () => setBulkDeleteConfirmOpen(false) },
    );
  };

  const handleBulkStatus = (status: EmployeeStatus) => {
    if (selectedIds.length === 0) return;
    bulkStatusMutation.mutate(
      { ids: selectedIds, status },
      { onSuccess: () => setBulkStatusConfirm(null) },
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      dispatch(clearEmployeeSelection());
    } else {
      dispatch(setSelectedEmployeeIds(employees.map((e) => e.id)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_EMPLOYEES}
        description={PAGE_DESCRIPTIONS.ADMIN_EMPLOYEES}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportMutation.mutate(filters)}
              disabled={exportMutation.isPending}
            >
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add employee
            </Button>
          </>
        }
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            value={filters.status ?? ''}
            onChange={(e) =>
              dispatch(
                setEmployeeFilters({
                  status: e.target.value as EmployeeStatus | '',
                  page: 1,
                }),
              )
            }
          >
            {EMPLOYEE_STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Country"
            value={filters.country ?? ''}
            onChange={(e) => dispatch(setEmployeeFilters({ country: e.target.value, page: 1 }))}
          />
          <Input
            placeholder="Company"
            value={filters.companyName ?? ''}
            onChange={(e) =>
              dispatch(setEmployeeFilters({ companyName: e.target.value, page: 1 }))
            }
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {selectedIds.length > 0 ? (
          <BulkActionBar
            count={selectedIds.length}
            itemLabel="employee"
            onClear={() => dispatch(clearEmployeeSelection())}
          >
            <Button size="sm" variant="outline" onClick={() => setBulkStatusConfirm('active')}>
              <UserCheck className="size-4" />
              Active
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBulkStatusConfirm('inactive')}>
              Inactive
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBulkStatusConfirm('suspended')}>
              Suspended
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </BulkActionBar>
        ) : null}
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load employees"
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
        ) : employees.length === 0 ? (
          <div className="space-y-4 p-8">
            <EmptyState
              title="No employees found"
              description="Try adjusting filters or add a new employee."
            />
            <div className="flex justify-center">
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Add employee
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} data-state={selectedIds.includes(employee.id) ? 'selected' : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(employee.id)}
                        onChange={() => dispatch(toggleEmployeeSelection(employee.id))}
                        aria-label={`Select ${employee.empName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar
                          employeeId={employee.id}
                          name={employee.empName}
                          hasProfilePhoto={Boolean(employee.profilePhoto)}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-medium">{employee.empName}</div>
                          <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.companyName}</TableCell>
                    <TableCell>
                      <p className="text-sm">{employee.phoneNo}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{employee.cityState}</p>
                      <p className="text-xs text-muted-foreground">{employee.country}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openView(employee)}
                          aria-label="View employee"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(employee)} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(employee)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages} · {meta.total} total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => dispatch(setEmployeeFilters({ page: meta.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => dispatch(setEmployeeFilters({ page: meta.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>

      <EmployeeDetailDialog
        employee={activeEmployee}
        open={dialogMode === 'view'}
        onClose={closeDialog}
        onEdit={(employee) => {
          setActiveEmployee(employee);
          setDialogMode('edit');
        }}
      />

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-3xl" onClose={closeDialog}>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Add employee' : 'Edit employee'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Create a new employee record with document and contact details.'
                : 'Update employee information. Leave password blank to keep unchanged.'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <EmployeeForm
              mode={dialogMode === 'create' ? 'create' : 'edit'}
              employee={activeEmployee ?? undefined}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onSubmit={dialogMode === 'create' ? handleCreate : handleUpdate}
              onCancel={closeDialog}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete employee"
        description={`Soft-delete ${activeEmployee?.empName ?? 'this employee'}? This can be restored from the database if needed.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete selected employees"
        description={`Soft-delete ${selectedIds.length} selected employee(s)?`}
        confirmText="Delete"
        variant="destructive"
        loading={bulkDeleteMutation.isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />

      <ConfirmDialog
        open={bulkStatusConfirm !== null}
        onOpenChange={(open) => !open && setBulkStatusConfirm(null)}
        title="Update employee status"
        description={`Set ${selectedIds.length} selected employee(s) to "${bulkStatusConfirm}"?`}
        confirmText="Update status"
        loading={bulkStatusMutation.isPending}
        onConfirm={() => bulkStatusConfirm && handleBulkStatus(bulkStatusConfirm)}
        onCancel={() => setBulkStatusConfirm(null)}
      />
    </div>
  );
}
