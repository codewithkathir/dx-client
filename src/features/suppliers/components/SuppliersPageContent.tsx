'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building, Pen, Plus, Search, Trash } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog';
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
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { SupplierForm } from '@/features/suppliers/components/SupplierForm';
import { useSupplierMutations, useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import type { PartyListFilters, PartyStatus, Supplier } from '@/types/finance.types';

/** "Gulf Office Supplies" → "GO". */
function companyInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? words[0]?.[1] ?? '')).toUpperCase();
}

function supplierBillsLabel(row: Supplier): string {
  const open = row.openBillCount ?? 0;
  const drafts = row.draftBillCount ?? 0;
  if (open) return `${open} open bill${open === 1 ? '' : 's'}`;
  if (drafts) return `${drafts} draft${drafts === 1 ? '' : 's'}`;
  return 'No open bills';
}

type DialogMode = 'create' | 'edit' | 'delete' | null;

export function SuppliersPageContent() {
  const [filters, setFilters] = useState<PartyListFilters>({
    page: 1,
    limit: 10,
    order: 'desc',
  });
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
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

      <Card className="gap-0 py-0" aria-label="Suppliers">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, contact, email or phone…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search suppliers"
            />
          </div>
          <Select
            className="w-auto flex-[0_1_170px]"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as PartyStatus | '',
                page: 1,
              }))
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel
                title="Failed to load suppliers"
                message={error?.message ?? 'Something went wrong'}
                onRetry={() => refetch()}
              />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={5} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No suppliers"
                description="Add the companies you buy from, then record their bills in Payables."
              />
            </div>
          ) : (
            <>
              <Table className="min-w-[900px] animate-in fade-in-0 duration-300">
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-semibold bg-muted text-[#33415a]"
                            aria-hidden
                          >
                            {companyInitials(row.companyName)}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium">{row.companyName}</div>
                            <div className="text-xs text-muted-foreground">
                              {supplierBillsLabel(row)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{row.contactName1 ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{row.email ?? '—'}</div>
                        {row.phone1 ? <div className="text-xs">{row.phone1}</div> : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[row.cityState, row.country].filter(Boolean).join(', ') || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'active' ? 'success' : 'muted'} dot>
                          {row.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
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
                            <Pen className="size-4" />
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
                            <Trash className="size-4 text-destructive" />
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
        </div>
      </Card>

      <Dialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog} className="max-w-[680px]">
          <DialogIconHeader
            icon={Building}
            tone="blue"
            title={dialogMode === 'create' ? 'Add supplier' : 'Edit supplier'}
            description="Companies you buy from. Each supplier can have bills in Payables."
          />
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
