'use client';

import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import { SupplierForm } from '@/features/suppliers/components/SupplierForm';
import { useSupplierMutations, useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { PartyListFilters, PartyStatus, Supplier } from '@/types/finance.types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

export function SuppliersPageContent() {
  const [filters, setFilters] = useState<PartyListFilters>({ page: 1, limit: 10, order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Supplier | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  // Go back to page 1 when the debounced search changes.
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useSuppliers({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { createSupplier, updateSupplier, deleteSupplier } = useSupplierMutations();
  const items = data?.items ?? [];

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_SUPPLIERS}
        description={PAGE_DESCRIPTIONS.ADMIN_SUPPLIERS}
        actions={
          <Button onClick={() => setDialogMode('create')}>
            <Plus className="size-4" />
            Add supplier
          </Button>
        }
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, contact, email or phone…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search suppliers"
            />
          </div>
          <Select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as PartyStatus | '', page: 1 }))
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load suppliers"
              message={error?.message ?? 'Something went wrong'}
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
              title="No suppliers"
              description="Add the companies you buy from, then record their bills in Payables."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email / phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.companyName}</TableCell>
                    <TableCell>{row.contactName1 ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{row.email ?? '—'}</div>
                      {row.phone1 ? <div className="text-xs">{row.phone1}</div> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[row.cityState, row.country].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'active' ? 'success' : 'muted'}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${row.companyName}`}
                          onClick={() => {
                            setActive(row);
                            setDialogMode('edit');
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${row.companyName}`}
                          onClick={() => {
                            setActive(row);
                            setDialogMode('delete');
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data?.meta ? (
              <TablePagination
                meta={data.meta}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            ) : null}
          </>
        )}
      </Card>

      <Dialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Add supplier' : 'Edit supplier'}</DialogTitle>
            <DialogDescription>Contact details used on bills and payments.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <SupplierForm
              supplier={active ?? undefined}
              isSubmitting={createSupplier.isPending || updateSupplier.isPending}
              onSubmit={(payload) => {
                if (dialogMode === 'create') {
                  createSupplier.mutate(payload, { onSuccess: closeDialog });
                } else if (active) {
                  updateSupplier.mutate({ id: active.id, payload }, { onSuccess: closeDialog });
                }
              }}
              onCancel={closeDialog}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete supplier"
        description={`Delete ${active?.companyName ?? 'this supplier'}? Suppliers with bills can't be deleted — set them to inactive instead.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteSupplier.isPending}
        onConfirm={() => active && deleteSupplier.mutate(active.id, { onSuccess: closeDialog })}
        onCancel={closeDialog}
      />
    </section>
  );
}
