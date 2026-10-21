'use client';

import { useState } from 'react';
import { Package, Pen, Plus, Search } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page.constants';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductMutations, useProducts } from '@/features/products/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { formatMoney } from '@/utils/money.utils';
import type { Product, ProductListFilters, ProductStatus } from '@/types/product.types';

type DialogMode = 'create' | 'edit' | null;

/** Price list. Products have no delete: making one inactive hides it from new invoices. */
export function ProductsPageContent() {
  const [filters, setFilters] = useState<ProductListFilters>({ page: 1, limit: 10, order: 'asc' });
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  // Go back to page 1 when the debounced search changes.
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useProducts({ ...filters, search: debouncedSearch || undefined });
  const { createProduct, updateProduct } = useProductMutations();
  const items = data?.items ?? [];

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={PAGE_TITLES.ADMIN_PRODUCTS}
        description={PAGE_DESCRIPTIONS.ADMIN_PRODUCTS}
        actions={
          <Button onClick={() => setDialogMode('create')}>
            <Plus className="size-4" />
            Add product
          </Button>
        }
      />

      <Card className="gap-0 py-0" aria-label="Products">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, code or description…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <Select
            className="w-auto flex-[0_1_170px]"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as ProductStatus | '', page: 1 }))}
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
              <ErrorPanel title="Failed to load products" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={5} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No products" description="Add the products and services you sell, with their prices." />
            </div>
          ) : (
            <>
              <Table className="min-w-[760px] animate-in fade-in-0 duration-300">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        {row.description ? (
                          <div className="max-w-[360px] truncate text-xs text-muted-foreground">{row.description}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.code ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{row.unit}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.unitPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'active' ? 'success' : 'muted'} dot>
                          {row.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${row.name}`}
                          onClick={() => {
                            setActive(row);
                            setDialogMode('edit');
                          }}
                        >
                          <Pen className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data?.meta ? (
                <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
              ) : null}
            </>
          )}
        </div>
      </Card>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent onClose={closeDialog} className="max-w-[620px]">
          <DialogIconHeader
            icon={Package}
            tone="green"
            title={dialogMode === 'create' ? 'Add product' : 'Edit product'}
            description="Its price fills in when you add it to an invoice, and can be changed there."
          />
          <DialogBody>
            <ProductForm
              key={active?.id ?? 'new'}
              product={active ?? undefined}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
              onSubmit={(payload) => {
                if (dialogMode === 'create') createProduct.mutate(payload, { onSuccess: closeDialog });
                else if (active) updateProduct.mutate({ id: active.id, payload }, { onSuccess: closeDialog });
              }}
              onCancel={closeDialog}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
