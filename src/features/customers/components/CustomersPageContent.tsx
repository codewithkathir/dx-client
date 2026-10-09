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
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { useCustomerMutations, useCustomers } from '@/features/customers/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { PartyListFilters, PartyStatus, Customer } from '@/types/finance.types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

export function CustomersPageContent() {
  const [filters, setFilters] = useState<PartyListFilters>({ page: 1, limit: 10, order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Customer | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  // Go back to page 1 when the debounced search changes.
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useCustomers({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { createCustomer, updateCustomer, deleteCustomer } = useCustomerMutations();
  const items = data?.items ?? [];

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_CUSTOMERS}
        description={PAGE_DESCRIPTIONS.ADMIN_CUSTOMERS}
        actions={
          <Button onClick={() => setDialogMode('create')}>
            <Plus className="size-4" />
            Add customer
          </Button>
        }
      />

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, contact, email, phone or TRN…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search customers"
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
              title="Failed to load customers"
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
              title="No customers"
              description="Add the companies you sell to, then raise invoices in Receivables."
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
                  <TableHead>TRN</TableHead>
                  <TableHead>Terms</TableHead>
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
                    <TableCell className="font-mono text-xs">{row.trn ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{row.paymentTerms ?? '—'}</TableCell>
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
            <DialogTitle>{dialogMode === 'create' ? 'Add customer' : 'Edit customer'}</DialogTitle>
            <DialogDescription>Details printed on tax invoices: address and TRN.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <CustomerForm
              customer={active ?? undefined}
              isSubmitting={createCustomer.isPending || updateCustomer.isPending}
              onSubmit={(payload) => {
                if (dialogMode === 'create') {
                  createCustomer.mutate(payload, { onSuccess: closeDialog });
                } else if (active) {
                  updateCustomer.mutate({ id: active.id, payload }, { onSuccess: closeDialog });
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
        title="Delete customer"
        description={`Delete ${active?.companyName ?? 'this customer'}? Customers with invoices can't be deleted — set them to inactive instead.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteCustomer.isPending}
        onConfirm={() => active && deleteCustomer.mutate(active.id, { onSuccess: closeDialog })}
        onCancel={closeDialog}
      />
    </section>
  );
}
