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
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { ServiceRecordDialog } from '@/features/vehicles/components/ServiceRecordDialog';
import {
  DUE_STATUS_LABELS,
  DUE_STATUS_VARIANT,
  dueStatus,
  formatKm,
  latestRecordIds,
} from '@/features/vehicles/constants/vehicle.constants';
import { useServiceRecordMutations, useServiceRecords } from '@/features/vehicles/hooks/useVehicles';
import type { AssetDetail } from '@/types/asset.types';
import type { ServiceRecord } from '@/types/vehicle.types';
import { formatMoney, todayIso } from '@/utils/money.utils';

/** Oil changes, services, insurance, registration… newest first, with what's due next. */
export function ServiceRecordsTab({ vehicle }: { vehicle: AssetDetail }) {
  const [typeFilter, setTypeFilter] = useState('');
  const [formRecord, setFormRecord] = useState<ServiceRecord | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const { data, isLoading, isError, error, refetch } = useServiceRecords(vehicle.id);
  const { createRecord, updateRecord, deleteRecord } = useServiceRecordMutations(vehicle.id);

  const records = data?.items ?? [];
  const latest = latestRecordIds(records);
  const today = todayIso();
  const currentKm = vehicle.odometer?.readingKm ?? null;
  const typesUsed = [...new Map(records.map((r) => [r.serviceTypeId, r.serviceTypeName])).entries()];
  const shown = typeFilter ? records.filter((r) => String(r.serviceTypeId) === typeFilter) : records;
  const editing = formRecord !== null && formRecord !== 'new' ? formRecord : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Select
          className="w-auto flex-[0_1_220px]"
          aria-label="Service type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All services</option>
          {typesUsed.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <div className="flex-1" />
        <Button onClick={() => setFormRecord('new')}>
          <Plus className="size-4" />
          Add record
        </Button>
      </div>

      <div className="border-t border-border">
        {isError ? (
          <div className="p-6">
            <ErrorPanel title="Failed to load service records" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableRowsSkeleton rows={5} />
        ) : shown.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No service records" description="Log oil changes, services, insurance and registration to see when they're due." />
          </div>
        ) : (
          <Table className="min-w-[980px] animate-in fade-in-0 duration-300">
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Done on</TableHead>
                <TableHead>Next due</TableHead>
                <TableHead className="text-right">Odometer</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((r) => {
                const status = dueStatus(r, latest.has(r.id), currentKm, today);
                return (
                  <TableRow key={r.id} className={status === 'done' ? 'text-muted-foreground' : undefined}>
                    <TableCell>
                      <div className="font-medium text-foreground">{r.serviceTypeName}</div>
                      {r.employeeName || r.expenseId ? (
                        <div className="text-xs text-muted-foreground">
                          {[r.employeeName ? `by ${r.employeeName}` : null, r.expenseId ? `from claim #${r.expenseId}` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatExpenseDate(r.startDate)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.endDate || r.nextDueKm !== null ? (
                        <>
                          {r.endDate ? <div>{formatExpenseDate(r.endDate)}</div> : null}
                          {r.nextDueKm !== null ? (
                            <div className={r.endDate ? 'text-xs text-muted-foreground' : undefined}>
                              {r.endDate ? 'or ' : ''}
                              {formatKm(r.nextDueKm)}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {r.odometerKm !== null ? formatKm(r.odometerKm) : '—'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {r.cost !== null ? formatMoney(r.cost) : '—'}
                    </TableCell>
                    <TableCell className="max-w-40 truncate font-mono text-[13px]">{r.referenceNo ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={DUE_STATUS_VARIANT[status]} dot>
                        {DUE_STATUS_LABELS[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${r.serviceTypeName}`} onClick={() => setFormRecord(r)}>
                        <Pen className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete ${r.serviceTypeName}`}
                        onClick={() => setDeleting(r)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ServiceRecordDialog
        key={editing ? `edit-${editing.id}` : 'new'}
        open={formRecord !== null}
        vehicle={vehicle}
        lastReading={vehicle.odometer}
        record={editing}
        isSubmitting={createRecord.isPending || updateRecord.isPending}
        onClose={() => setFormRecord(null)}
        onSubmit={(payload) => {
          if (editing) updateRecord.mutate({ id: editing.id, payload }, { onSuccess: () => setFormRecord(null) });
          else createRecord.mutate(payload, { onSuccess: () => setFormRecord(null) });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete service record"
        description={`Delete the ${deleting?.serviceTypeName ?? ''} from ${deleting ? formatExpenseDate(deleting.startDate) : ''}? Its odometer reading is removed too.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteRecord.isPending}
        onConfirm={() => deleting && deleteRecord.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
