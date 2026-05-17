'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';
import { CatalogStatusBadge } from '@/features/catalog/components/CatalogStatusBadge';
import { CategoryForm } from '@/features/catalog/components/CategoryForm';
import { CATALOG_STATUS_OPTIONS } from '@/features/catalog/constants/catalog.constants';
import { useCatalogMutations } from '@/features/catalog/hooks/useCatalogMutations';
import { useCategories } from '@/features/catalog/hooks/useCatalogQueries';
import type { CategoryFormValues } from '@/features/catalog/schemas/category.schema';
import { UI_PANEL } from '@/constants/ui.constants';
import { useDebounce } from '@/hooks/useDebounce';
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
import type { CatalogListFilters, CatalogStatus, Category } from '@/types/catalog.types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

const defaultFilters: CatalogListFilters = { page: 1, limit: 10, order: 'desc' };

export function CategoriesTab() {
  const [filters, setFilters] = useState<CatalogListFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<Category | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const { data, isLoading, isError, error, refetch, isFetching } = useCategories({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { createCategory, updateCategory, deleteCategory } = useCatalogMutations();

  const items = data?.items ?? [];
  const meta = data?.meta;

  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1 }));
  }, [debouncedSearch]);

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" onClick={() => setDialogMode('create')}>
          <Plus className="mr-2 size-4" />
          Add category
        </Button>
      </div>

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as CatalogStatus | '',
                page: 1,
              }))
            }
          >
            {CATALOG_STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      <Card className={cn(UI_PANEL.table, 'gap-0 py-0')}>
        {isError ? (
          <div className="p-6">
            <ErrorPanel
              title="Failed to load categories"
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
              title="No categories"
              description="Create your first main category to start building the hierarchy."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {row.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <CatalogStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setActive(row);
                            setDialogMode('edit');
                          }}
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setActive(row);
                            setDialogMode('delete');
                          }}
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
              <CatalogPagination
                meta={meta}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            ) : null}
          </>
        )}
      </Card>

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Add category' : 'Edit category'}</DialogTitle>
            <DialogDescription>Main category (top level of the catalog hierarchy).</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <CategoryForm
              category={active ?? undefined}
              isSubmitting={createCategory.isPending || updateCategory.isPending}
              onSubmit={(values: CategoryFormValues) => {
                if (dialogMode === 'create') {
                  createCategory.mutate(values, { onSuccess: closeDialog });
                } else if (active) {
                  updateCategory.mutate(
                    { id: active.id, payload: values },
                    { onSuccess: closeDialog },
                  );
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
        title="Delete category"
        description={`Soft-delete ${active?.name ?? 'this category'}? Sub categories may remain linked.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteCategory.isPending}
        onConfirm={() => active && deleteCategory.mutate(active.id, { onSuccess: closeDialog })}
        onCancel={closeDialog}
      />
    </div>
  );
}
