'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car, CircleAlert, Clock, Pen, Plus, Search, UserCheck, Wrench } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { AssetFormDialog } from '@/features/assets/components/AssetFormDialog';
import { AssetIcon } from '@/features/assets/components/AssetIcon';
import { AssetThumb } from '@/features/assets/components/AssetThumb';
import { AssignAssetDialog } from '@/features/assets/components/AssignAssetDialog';
import { ReturnAssetDialog } from '@/features/assets/components/ReturnAssetDialog';
import { ASSET_STATUS_LABELS, ASSET_STATUS_VARIANT } from '@/features/assets/constants/asset.constants';
import { useAssetMutations, useAssets } from '@/features/assets/hooks/useAssets';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { ServiceTypesTab } from '@/features/vehicles/components/ServiceTypesTab';
import { formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { Asset, AssetListFilters, AssetStatus } from '@/types/asset.types';

type VehiclesTab = 'vehicles' | 'service-types';

const COUNT = { category: 'vehicle', page: 1, limit: 1 } as const;

/** Vehicle management: the company's vehicles (assets of category "vehicle"), their drivers and service types. */
export function VehiclesPageContent() {
  const [tab, setTab] = useState<VehiclesTab>('vehicles');
  const [filters, setFilters] = useState<AssetListFilters>({ page: 1, limit: 10, category: 'vehicle' });
  const [searchInput, setSearchInput] = useState('');
  const [formVehicle, setFormVehicle] = useState<Asset | 'new' | null>(null);
  const [assigning, setAssigning] = useState<Asset | null>(null);
  const [returning, setReturning] = useState<Asset | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useAssets({ ...filters, search: debouncedSearch || undefined });
  const counts = {
    total: useAssets(COUNT).data?.meta.total,
    assigned: useAssets({ ...COUNT, status: 'assigned' }).data?.meta.total,
    available: useAssets({ ...COUNT, status: 'available' }).data?.meta.total,
    inRepair: useAssets({ ...COUNT, status: 'in_repair' }).data?.meta.total,
  };
  const { createAsset, updateAsset, assignAsset, returnAsset } = useAssetMutations();
  const items = data?.items ?? [];
  const editing = formVehicle !== null && formVehicle !== 'new' ? formVehicle : undefined;
  const countsReady = Object.values(counts).every((c) => c !== undefined);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Vehicles"
        description="Company vehicles, who is driving them, and their service, insurance and odometer history."
        actions={
          tab === 'vehicles' ? (
            <Button size="lg" onClick={() => setFormVehicle('new')}>
              <Plus className="size-4" />
              Add vehicle
            </Button>
          ) : null
        }
      />

      {!countsReady ? (
        <StatCardsSkeleton />
      ) : (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Vehicles" value={String(counts.total)} hint="In the fleet" icon={Car} tone="outstanding" iconColor="blue" iconTile />
          <StatCard label="With a driver" value={String(counts.assigned)} hint="Currently assigned" icon={UserCheck} iconTile />
          <StatCard label="Available" value={String(counts.available)} hint="Ready to assign" icon={Car} tone="settled" iconTile />
          <StatCard
            label="In repair"
            value={String(counts.inRepair)}
            hint="Off the road"
            icon={Wrench}
            tone={counts.inRepair ? 'pending' : 'plain'}
            iconTile
          />
        </section>
      )}

      <Card className="gap-0 py-0" aria-label="Vehicles">
        <div role="tablist" aria-label="Vehicle management" className="flex flex-wrap border-b border-border px-5">
          {(
            [
              ['vehicles', 'Vehicles'],
              ['service-types', 'Service types'],
            ] as const
          ).map(([id, label]) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={cn(
                  'flex h-12 items-center gap-2 px-3 text-sm transition-colors',
                  selected
                    ? 'font-semibold text-primary shadow-[inset_0_-2px_0_var(--primary)]'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === 'service-types' ? (
          <ServiceTypesTab />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative min-w-0 flex-[2_1_260px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  className="pl-9"
                  placeholder="Search registration, name, make or driver…"
                  aria-label="Search vehicles"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                className="w-auto flex-[0_1_170px]"
                aria-label="Status"
                value={filters.status ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AssetStatus | '', page: 1 }))}
              >
                <option value="">All statuses</option>
                {(Object.keys(ASSET_STATUS_LABELS) as AssetStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s === 'assigned' ? 'With driver' : ASSET_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="border-t border-border">
              {isError ? (
                <div className="p-6">
                  <ErrorPanel title="Failed to load vehicles" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
                </div>
              ) : isLoading ? (
                <TableRowsSkeleton rows={6} />
              ) : items.length === 0 ? (
                <div className="p-8">
                  <EmptyState title="No vehicles" description="Add your company cars, vans and trucks to track drivers and services." />
                </div>
              ) : (
                <Table className="min-w-[940px] animate-in fade-in-0 duration-300">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Make / model</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Odometer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((v) => {
                      const a = v.currentAssignment;
                      return (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {v.coverImageId ? (
                                <AssetThumb src={API_ENDPOINTS.ASSETS.IMAGE(v.id, v.coverImageId)} alt="" className="size-9 shrink-0" />
                              ) : (
                                <AssetIcon category={v.category} />
                              )}
                              <div className="min-w-0">
                                <Link
                                  href={ADMIN_ROUTES.VEHICLE_DETAIL(v.id)}
                                  className="font-mono text-sm font-semibold hover:text-primary hover:underline"
                                >
                                  {v.assetNo}
                                </Link>
                                <div className="text-xs text-muted-foreground">{v.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{[v.brand, v.model].filter(Boolean).join(' ') || '—'}</TableCell>
                          <TableCell>
                            {a ? (
                              <div>
                                <div className="font-medium whitespace-nowrap">{a.employeeName}</div>
                                <div className="text-xs whitespace-nowrap text-muted-foreground">Since {formatExpenseDate(a.assignedDate)}</div>
                                {!a.acknowledgedAt ? (
                                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-status-warning-ink">
                                    <Clock className="size-3" aria-hidden />
                                    Not confirmed
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No driver</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap tabular-nums">
                            {v.odometerKm != null ? formatKm(v.odometerKm) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={ASSET_STATUS_VARIANT[v.status]} dot>
                              {v.status === 'assigned' ? 'With driver' : ASSET_STATUS_LABELS[v.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {v.status === 'available' ? (
                                <Button variant="outline" size="sm" onClick={() => setAssigning(v)}>
                                  Assign driver
                                </Button>
                              ) : v.status === 'assigned' ? (
                                <Button variant="outline" size="sm" onClick={() => setReturning(v)}>
                                  Record return
                                </Button>
                              ) : null}
                              <Button variant="outline" size="sm" render={<Link href={ADMIN_ROUTES.VEHICLE_DETAIL(v.id)} />}>
                                Open
                              </Button>
                              <Button variant="ghost" size="icon" aria-label={`Edit ${v.assetNo}`} onClick={() => setFormVehicle(v)}>
                                <Pen className="size-4" />
                              </Button>
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
          </>
        )}
      </Card>

      {counts.inRepair ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="size-4" aria-hidden />
          Vehicles in repair can&apos;t be assigned until they&apos;re marked available.
        </p>
      ) : null}

      <AssetFormDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formVehicle !== null}
        asset={editing}
        vehicle
        isSubmitting={createAsset.isPending || updateAsset.isPending}
        onClose={() => setFormVehicle(null)}
        onSubmit={(payload) => {
          if (editing) updateAsset.mutate({ id: editing.id, payload }, { onSuccess: () => setFormVehicle(null) });
          else createAsset.mutate(payload, { onSuccess: () => setFormVehicle(null) });
        }}
      />

      <AssignAssetDialog
        key={assigning ? `assign-${assigning.id}` : 'assign'}
        asset={assigning}
        isSubmitting={assignAsset.isPending}
        onClose={() => setAssigning(null)}
        onSubmit={(payload) => assigning && assignAsset.mutate({ id: assigning.id, payload }, { onSuccess: () => setAssigning(null) })}
      />

      <ReturnAssetDialog
        key={returning ? `return-${returning.id}` : 'return'}
        asset={returning}
        isSubmitting={returnAsset.isPending}
        onClose={() => setReturning(null)}
        onSubmit={(payload) => returning && returnAsset.mutate({ id: returning.id, payload }, { onSuccess: () => setReturning(null) })}
      />
    </section>
  );
}
