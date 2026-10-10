'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CircleAlert, Clock, Eye, Package, PackageCheck, Pen, Plus, Search, Trash, UserCheck } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssetDetailDialog } from '@/features/assets/components/AssetDetailDialog';
import { AssetFormDialog } from '@/features/assets/components/AssetFormDialog';
import { AssetIcon } from '@/features/assets/components/AssetIcon';
import { AssetThumb } from '@/features/assets/components/AssetThumb';
import { AssignAssetDialog } from '@/features/assets/components/AssignAssetDialog';
import { ReturnAssetDialog } from '@/features/assets/components/ReturnAssetDialog';
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_VARIANT,
} from '@/features/assets/constants/asset.constants';
import { useAssetMutations, useAssetSummary, useAssets } from '@/features/assets/hooks/useAssets';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { Asset, AssetCategory, AssetListFilters, AssetStatus } from '@/types/asset.types';
import { formatMoney } from '@/utils/money.utils';

export function AssetsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const assetParam = Number(searchParams.get('asset'));
  const openAssetId = Number.isInteger(assetParam) && assetParam > 0 ? assetParam : null;
  const employeeParam = Number(searchParams.get('employee'));

  const [filters, setFilters] = useState<AssetListFilters>({
    page: 1,
    limit: 10,
    ...(Number.isInteger(employeeParam) && employeeParam > 0 ? { employeeId: employeeParam } : {}),
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [formAsset, setFormAsset] = useState<Asset | 'new' | null>(null);
  const [assigning, setAssigning] = useState<Asset | null>(null);
  const [returning, setReturning] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useAssets({ ...filters, search: debouncedSearch || undefined });
  const { data: summary, isLoading: summaryLoading } = useAssetSummary();
  const { createAsset, updateAsset, deleteAsset, assignAsset, returnAsset } = useAssetMutations();
  const items = data?.items ?? [];

  const setOpenAsset = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('asset', String(id));
    else params.delete('asset');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const editing = formAsset !== null && formAsset !== 'new' ? formAsset : undefined;
  const filteredEmployee = filters.employeeId ? items[0]?.currentAssignment?.employeeName : null;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Assets"
        description="Company equipment, who has it, and its hand-over history."
        actions={
          <Button size="lg" onClick={() => setFormAsset('new')}>
            <Plus className="size-4" />
            Add asset
          </Button>
        }
      />

      {summaryLoading || !summary ? (
        <StatCardsSkeleton />
      ) : (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total assets"
            value={String(summary.total)}
            hint={`${formatMoney(summary.totalValue)} in use`}
            icon={Package}
            tone="outstanding"
            iconColor="blue"
            iconTile
          />
          <StatCard
            label="Assigned"
            value={String(summary.byStatus.assigned)}
            hint={
              summary.awaitingAcknowledgement ? `${summary.awaitingAcknowledgement} not confirmed by employee` : 'All confirmed'
            }
            icon={UserCheck}
            iconTile
          />
          <StatCard
            label="Available"
            value={String(summary.byStatus.available)}
            hint="Ready to assign"
            icon={PackageCheck}
            tone="settled"
            iconTile
          />
          <StatCard
            label="Needs attention"
            value={String(summary.byStatus.in_repair + summary.overdueReturns + summary.byStatus.lost)}
            hint={`${summary.byStatus.in_repair} in repair · ${summary.overdueReturns} overdue · ${summary.byStatus.lost} lost`}
            icon={CircleAlert}
            tone={summary.overdueReturns + summary.byStatus.lost > 0 ? 'overdue' : 'pending'}
            iconTile
          />
        </section>
      )}

      <Card className="gap-0 py-0" aria-label="Assets">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              className="pl-9"
              placeholder="Search name, tag, serial, brand or employee…"
              aria-label="Search assets"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            className="w-auto flex-[1_1_160px]"
            aria-label="Category"
            value={filters.category ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as AssetCategory | '', page: 1 }))}
          >
            <option value="">All categories</option>
            {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((c) => (
              <option key={c} value={c}>
                {ASSET_CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
          <Select
            className="w-auto flex-[0_1_170px]"
            aria-label="Status"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AssetStatus | '', page: 1 }))}
          >
            <option value="">All statuses</option>
            {(Object.keys(ASSET_STATUS_LABELS) as AssetStatus[]).map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          {filters.employeeId ? (
            <Badge variant="secondary" className="h-8 gap-2 px-3">
              Assigned to {filteredEmployee ?? `employee #${filters.employeeId}`}
              <button
                type="button"
                aria-label="Clear employee filter"
                className="font-semibold"
                onClick={() => setFilters((f) => ({ ...f, employeeId: undefined, page: 1 }))}
              >
                ×
              </button>
            </Badge>
          ) : null}
        </div>

        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel
                title="Failed to load assets"
                message={error?.message ?? 'Something went wrong'}
                onRetry={() => refetch()}
              />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No assets"
                description="Add the laptops, phones, vehicles and cards you hand out to employees."
              />
            </div>
          ) : (
            <Table className="min-w-[980px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Serial no.</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((asset) => {
                  const a = asset.currentAssignment;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {asset.coverImageId ? (
                            <AssetThumb
                              src={API_ENDPOINTS.ASSETS.IMAGE(asset.id, asset.coverImageId)}
                              alt=""
                              className="size-9 shrink-0"
                            />
                          ) : (
                            <AssetIcon category={asset.category} />
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setOpenAsset(asset.id)}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {asset.name}
                            </button>
                            <div className="font-mono text-xs text-muted-foreground">{asset.assetNo}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{ASSET_CATEGORY_LABELS[asset.category]}</TableCell>
                      <TableCell className="font-mono text-[13px] text-muted-foreground">{asset.serialNo ?? '—'}</TableCell>
                      <TableCell>
                        {a ? (
                          <div>
                            <div className="font-medium whitespace-nowrap">{a.employeeName}</div>
                            <div
                              className={cn(
                                'text-xs whitespace-nowrap',
                                a.isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground',
                              )}
                            >
                              {a.isOverdue && a.expectedReturnDate
                                ? `Overdue since ${formatExpenseDate(a.expectedReturnDate)}`
                                : `Since ${formatExpenseDate(a.assignedDate)}`}
                            </div>
                            {!a.acknowledgedAt ? (
                              <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-status-warning-ink">
                                <Clock className="size-3" aria-hidden />
                                Not confirmed
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{ASSET_CONDITION_LABELS[asset.condition]}</TableCell>
                      <TableCell>
                        <Badge variant={ASSET_STATUS_VARIANT[asset.status]} dot>
                          {ASSET_STATUS_LABELS[asset.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {asset.status === 'available' ? (
                            <Button variant="outline" size="sm" onClick={() => setAssigning(asset)}>
                              Assign
                            </Button>
                          ) : asset.status === 'assigned' ? (
                            <Button variant="outline" size="sm" onClick={() => setReturning(asset)}>
                              Record return
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View ${asset.name}`}
                            onClick={() => setOpenAsset(asset.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${asset.name}`}
                            onClick={() => setFormAsset(asset)}
                          >
                            <Pen className="size-4" />
                          </Button>
                          {asset.status !== 'assigned' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Delete ${asset.name}`}
                              onClick={() => setDeleting(asset)}
                            >
                              <Trash className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        {data?.meta && items.length > 0 ? (
          <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        ) : null}
      </Card>

      <AssetDetailDialog
        assetId={openAssetId}
        onClose={() => setOpenAsset(null)}
        onEdit={(asset) => {
          setOpenAsset(null);
          setFormAsset(asset);
        }}
        onAssign={(asset) => {
          setOpenAsset(null);
          setAssigning(asset);
        }}
        onReturn={(asset) => {
          setOpenAsset(null);
          setReturning(asset);
        }}
        onDelete={(asset) => {
          setOpenAsset(null);
          setDeleting(asset);
        }}
      />

      <AssetFormDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formAsset !== null}
        asset={editing}
        isSubmitting={createAsset.isPending || updateAsset.isPending}
        onClose={() => setFormAsset(null)}
        onSubmit={(payload) => {
          if (editing) updateAsset.mutate({ id: editing.id, payload }, { onSuccess: () => setFormAsset(null) });
          else
            createAsset.mutate(payload, {
              onSuccess: (asset) => {
                setFormAsset(null);
                setOpenAsset(asset.id);
              },
            });
        }}
      />

      <AssignAssetDialog
        key={assigning ? `assign-${assigning.id}` : 'assign'}
        asset={assigning}
        isSubmitting={assignAsset.isPending}
        onClose={() => setAssigning(null)}
        onSubmit={(payload) =>
          assigning && assignAsset.mutate({ id: assigning.id, payload }, { onSuccess: () => setAssigning(null) })
        }
      />

      <ReturnAssetDialog
        key={returning ? `return-${returning.id}` : 'return'}
        asset={returning}
        isSubmitting={returnAsset.isPending}
        onClose={() => setReturning(null)}
        onSubmit={(payload) =>
          returning && returnAsset.mutate({ id: returning.id, payload }, { onSuccess: () => setReturning(null) })
        }
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete asset"
        description={`Delete ${deleting?.name ?? 'this asset'} (${deleting?.assetNo ?? ''})? Its hand-over history is kept.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteAsset.isPending}
        onConfirm={() => deleting && deleteAsset.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
