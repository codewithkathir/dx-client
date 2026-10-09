'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Eye, Pen, Plus, Search, Trash, User, UserCheck, Users } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { cn } from '@/lib/utils';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { BulkActionBar } from '@/components/shared/BulkActionBar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TablePagination } from '@/components/tables/TablePagination';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
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
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') ?? filters.search ?? '',
  );
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

  const allSelected = employees.length > 0 && employees.every((e) => selectedIds.includes(e.id));

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
            <Button loading={exportMutation.isPending}
              variant="outline"
              size="lg"
              onClick={() => exportMutation.mutate(filters)}
              disabled={exportMutation.isPending}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button size="lg" onClick={openCreate}>
              <Plus className="size-4" />
              Add employee
            </Button>
          </>
        }
      />

      <Card className="gap-0 py-0" aria-label="Employees">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search name, email, phone…"
              aria-label="Search employees"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Input
            className="w-auto flex-[1_1_160px]"
            placeholder="Company"
            aria-label="Company"
            value={filters.companyName ?? ''}
            onChange={(e) => dispatch(setEmployeeFilters({ companyName: e.target.value, page: 1 }))}
          />
          <Input
            className="w-auto flex-[1_1_140px]"
            placeholder="Country"
            aria-label="Country"
            value={filters.country ?? ''}
            onChange={(e) => dispatch(setEmployeeFilters({ country: e.target.value, page: 1 }))}
          />
          <Select
            className="w-auto flex-[0_1_170px]"
            aria-label="Status"
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
        </div>
        {selectedIds.length > 0 ? (
          <BulkActionBar
            count={selectedIds.length}
            itemLabel="employee"
            onClear={() => dispatch(clearEmployeeSelection())}
          >
            <Button size="sm" variant="outline" onClick={() => setBulkStatusConfirm('active')}>
              Update status
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              disabled={bulkDeleteMutation.isPending}
            >
              Delete
            </Button>
          </BulkActionBar>
        ) : null}
        <div className="border-t border-border">
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
            <TableRowsSkeleton rows={5} />
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
              <Table className="min-w-[900px] animate-in fade-in-0 duration-300">
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
                    <TableRow
                      key={employee.id}
                      data-state={selectedIds.includes(employee.id) ? 'selected' : undefined}
                    >
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
                            <p className="truncate text-xs text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.companyName}</TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">{employee.phoneNo}</div>
                        <div className="text-xs text-muted-foreground">
                          {!employee.whatsappNo
                            ? '—'
                            : employee.whatsappNo === employee.phoneNo
                              ? 'WhatsApp same'
                              : `WA ${employee.whatsappNo}`}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {[employee.cityState, employee.country].filter(Boolean).join(', ') || '—'}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(employee)}
                            aria-label="Edit"
                          >
                            <Pen className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(employee)}
                            aria-label="Delete"
                          >
                            <Trash className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta ? (
                <TablePagination
                  meta={meta}
                  onPageChange={(page) => dispatch(setEmployeeFilters({ page }))}
                />
              ) : null}
            </>
          )}
        </div>
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

      <Dialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent className="max-w-[760px]" onClose={closeDialog}>
          <DialogIconHeader
            icon={User}
            title={dialogMode === 'create' ? 'Add employee' : 'Edit employee'}
            description={dialogMode === 'create'
                ? "Create the employee's record and portal login. Fields marked * are required."
                : 'Update employee information. Leave password blank to keep unchanged.'}
          />
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
        icon={Users}
        title="Update employee status"
        description={`Apply to ${selectedIds.length} selected employee${selectedIds.length === 1 ? '' : 's'}.`}
        confirmText={`Update ${selectedIds.length} employee${selectedIds.length === 1 ? '' : 's'}`}
        loading={bulkStatusMutation.isPending}
        onConfirm={() => bulkStatusConfirm && handleBulkStatus(bulkStatusConfirm)}
      >
        <Select
          aria-label="New status"
          value={bulkStatusConfirm ?? 'active'}
          onChange={(e) => setBulkStatusConfirm(e.target.value as EmployeeStatus)}
        >
          {EMPLOYEE_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </ConfirmDialog>
    </div>
  );
}
