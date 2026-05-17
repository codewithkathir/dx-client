'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';
import { CatalogStatusBadge } from '@/features/catalog/components/CatalogStatusBadge';
import { SubCategoryForm } from '@/features/catalog/components/SubCategoryForm';
import { CATALOG_STATUS_OPTIONS } from '@/features/catalog/constants/catalog.constants';
import { useCatalogMutations } from '@/features/catalog/hooks/useCatalogMutations';
import { useCategoryOptions, useSubCategories } from '@/features/catalog/hooks/useCatalogQueries';
import type { SubCategoryFormValues } from '@/features/catalog/schemas/sub-category.schema';
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
import type { CatalogListFilters, CatalogStatus, SubCategory } from '@/types/catalog.types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

export function SubCategoriesTab() {
  const [filters, setFilters] = useState<CatalogListFilters>({
    page: 1,
    limit: 10,
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [active, setActive] = useState<SubCategory | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const queryFilters = {
    ...filters,
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId || undefined,
  };

  const { data: categoryOptions } = useCategoryOptions();
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categoryOptions?.items.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categoryOptions]);

  const { data, isLoading, isError, error, refetch, isFetching } = useSubCategories(queryFilters);
  const { createSubCategory, updateSubCategory, deleteSubCategory } = useCatalogMutations();

  const items = data?.items ?? [];
  const meta = data?.meta;
  const categories = categoryOptions?.items ?? [];

  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1 }));
  }, [debouncedSearch]);

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={() => setDialogMode('create')}>
        <Plus className="mr-2 size-4" />
        Add sub category
      </Button>

      <Card className={UI_PANEL.filter}>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sub categories…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
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
              title="Failed to load sub categories"
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
            <EmptyState title="No sub categories" description="Add a sub category under a main category." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Main category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">
                      {categoryMap.get(row.categoryId) ?? `#${row.categoryId}`}
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
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
            <DialogTitle>{dialogMode === 'create' ? 'Add sub category' : 'Edit sub category'}</DialogTitle>
            <DialogDescription>Child of a main category.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <SubCategoryForm
              subCategory={active ?? undefined}
              defaultCategoryId={filters.categoryId}
              isSubmitting={createSubCategory.isPending || updateSubCategory.isPending}
              onSubmit={(values: SubCategoryFormValues) => {
                if (dialogMode === 'create') {
                  createSubCategory.mutate(values, { onSuccess: closeDialog });
                } else if (active) {
                  updateSubCategory.mutate(
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
        title="Delete sub category"
        description={`Soft-delete ${active?.name ?? 'this sub category'}?`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteSubCategory.isPending}
        onConfirm={() => active && deleteSubCategory.mutate(active.id, { onSuccess: closeDialog })}
        onCancel={closeDialog}
      />
    </div>
  );
}
