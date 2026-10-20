'use client';

import { useState } from 'react';
import { Pen, Plus, Trash } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ASSET_CATEGORY_LABELS } from '@/features/assets/constants/asset.constants';
import { ServiceTypeDialog } from '@/features/vehicles/components/ServiceTypeDialog';
import { useServiceTypeMutations, useServiceTypes } from '@/features/vehicles/hooks/useVehicles';
import type { AssetCategory } from '@/types/asset.types';
import type { ServiceType, ServiceTypeListFilters } from '@/types/vehicle.types';

const formatInterval = (t: ServiceType) =>
  [t.intervalDays ? `${t.intervalDays} days` : null, t.intervalKm ? `${t.intervalKm.toLocaleString('en-US')} km` : null]
    .filter(Boolean)
    .join(' or ') || 'One-off';

/** What can be logged against a vehicle (oil change, insurance…) and how often it falls due. */
export function ServiceTypesTab() {
  const [filters, setFilters] = useState<ServiceTypeListFilters>({ category: 'vehicle' });
  const [formType, setFormType] = useState<ServiceType | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ServiceType | null>(null);
  const { data, isLoading, isError, error, refetch } = useServiceTypes(filters);
  const { createType, updateType, deleteType } = useServiceTypeMutations();
  const items = data?.items ?? [];
  const editing = formType !== null && formType !== 'new' ? formType : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Select
          className="w-auto flex-[0_1_200px]"
          aria-label="Applies to"
          value={filters.category ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as AssetCategory | '' }))}
        >
          <option value="">All asset types</option>
          {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((c) => (
            <option key={c} value={c}>
              {ASSET_CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
        <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">
          The interval fills in the next due date and km when a record is added.
        </p>
        <Button variant="outline" onClick={() => setFormType('new')}>
          <Plus className="size-4" />
          Add service type
        </Button>
      </div>

      <div className="border-t border-border">
        {isError ? (
          <div className="p-6">
            <ErrorPanel title="Failed to load service types" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableRowsSkeleton rows={5} />
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No service types" description="Add the services and renewals you track, like Oil change or Insurance." />
          </div>
        ) : (
          <Table className="min-w-[760px] animate-in fade-in-0 duration-300">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Applies to</TableHead>
                <TableHead>Due every</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="font-mono text-[13px] text-muted-foreground">{t.code}</TableCell>
                  <TableCell>{t.category ? ASSET_CATEGORY_LABELS[t.category] : 'All assets'}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatInterval(t)}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'active' ? 'success' : 'muted'} dot>
                      {t.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${t.name}`} onClick={() => setFormType(t)}>
                      <Pen className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete ${t.name}`}
                      onClick={() => setDeleting(t)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ServiceTypeDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formType !== null}
        serviceType={editing}
        isSubmitting={createType.isPending || updateType.isPending}
        onClose={() => setFormType(null)}
        onSubmit={(payload) => {
          if (editing) updateType.mutate({ id: editing.id, payload }, { onSuccess: () => setFormType(null) });
          else createType.mutate(payload, { onSuccess: () => setFormType(null) });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete service type"
        description={`Delete ${deleting?.name ?? 'this service type'}? Types already used on a record can't be deleted — mark them inactive instead.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteType.isPending}
        onConfirm={() => deleting && deleteType.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
