'use client';

import { useState } from 'react';
import { FolderTree, Pen, Plus, Search, Trash } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TablePagination } from '@/components/tables/TablePagination';
import { CatalogStatusBadge } from '@/features/catalog/components/CatalogStatusBadge';
import { CategoryForm } from '@/features/catalog/components/CategoryForm';
import { CATALOG_STATUS_OPTIONS } from '@/features/catalog/constants/catalog.constants';
import { useCatalogMutations } from '@/features/catalog/hooks/useCatalogMutations';
import { useCategories } from '@/features/catalog/hooks/useCatalogQueries';
import type { CategoryFormValues } from '@/features/catalog/schemas/category.schema';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import type { CatalogListFilters, CatalogStatus, Category } from '@/types/catalog.types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

const defaultFilters: CatalogListFilters = {
  page: 1,
  limit: 10,
  order: 'desc',
};

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

  // Go back to page 1 when the debounced search changes.
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const closeDialog = () => {
    setDialogMode(null);
    setActive(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-0 max-w-[420px] flex-[1_1_260px]">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search categories"
            placeholder="Search categories…"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          className="w-auto flex-[0_1_180px]"
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
        <Button className="ml-auto" onClick={() => setDialogMode('create')}>
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      <div className="border-t border-border">
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
          <TableRowsSkeleton rows={5} />
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No categories"
              description="Create your first main category to start building the hierarchy."
            />
          </div>
        ) : (
          <>
            <Table className="animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sub categories</TableHead>
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
                    <TableCell className="tabular-nums">{row.subCategoryCount ?? '—'}</TableCell>
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
                          <Pen className="size-4" />
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
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            ) : null}
          </>
        )}
      </div>

      <Dialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent className="max-w-[420px]" onClose={closeDialog}>
          <DialogIconHeader
            icon={FolderTree}
            eyebrow="Level 1"
            title={dialogMode === 'create' ? 'Add category' : 'Edit category'}
            description="A main group, like Travel or Meals."
          />
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
