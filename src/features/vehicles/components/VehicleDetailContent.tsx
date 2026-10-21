'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, Car, Gauge, Pen, Undo2, UserPlus, Wallet } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { AssetFormDialog } from '@/features/assets/components/AssetFormDialog';
import { AssetPhotos } from '@/features/assets/components/AssetPhotos';
import { AssignAssetDialog } from '@/features/assets/components/AssignAssetDialog';
import { ReturnAssetDialog } from '@/features/assets/components/ReturnAssetDialog';
import { ASSET_CONDITION_LABELS, ASSET_STATUS_LABELS, ASSET_STATUS_VARIANT } from '@/features/assets/constants/asset.constants';
import { useAsset, useAssetMutations } from '@/features/assets/hooks/useAssets';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { OdometerTab } from '@/features/vehicles/components/OdometerTab';
import { ServiceRecordsTab } from '@/features/vehicles/components/ServiceRecordsTab';
import { DUE_STATUS_LABELS, dueStatus, formatKm, latestRecordIds, type DueStatus } from '@/features/vehicles/constants/vehicle.constants';
import { VehicleExpensesTab } from '@/features/vehicles/components/VehicleExpensesTab';
import { useServiceRecords, useVehicleExpenseSummary } from '@/features/vehicles/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { AssetDetail } from '@/types/asset.types';
import { formatMoney, todayIso } from '@/utils/money.utils';

type DetailTab = 'services' | 'expenses' | 'odometer' | 'drivers' | 'details';

const TABS: Array<[DetailTab, string]> = [
  ['services', 'Service & compliance'],
  ['expenses', 'Expenses'],
  ['odometer', 'Odometer'],
  ['drivers', 'Drivers'],
  ['details', 'Details & photos'],
];

const URGENCY: Record<DueStatus, number> = { overdue: 0, due_soon: 1, ok: 2, done: 3 };

/** One vehicle: driver, km, what's due, and its full history. */
export function VehicleDetailContent({ vehicleId }: { vehicleId: number }) {
  const [tab, setTab] = useState<DetailTab>('services');
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [returning, setReturning] = useState(false);
  const { data: vehicle, isLoading, isError, error, refetch } = useAsset(vehicleId);
  const { data: records } = useServiceRecords(vehicleId);
  const { data: spend } = useVehicleExpenseSummary(vehicleId);
  const { updateAsset, assignAsset, returnAsset } = useAssetMutations();

  if (isError) {
    return (
      <section className="space-y-5">
        <BackLink />
        <ErrorPanel title="Couldn't load this vehicle" message={error?.message ?? 'It may have been deleted.'} onRetry={() => refetch()} />
      </section>
    );
  }
  if (isLoading || !vehicle) {
    return (
      <section className="space-y-5">
        <BackLink />
        <Skeleton className="h-12 w-72" />
        <StatCardsSkeleton />
        <Skeleton className="h-80 w-full rounded-xl" />
      </section>
    );
  }

  const driver = vehicle.currentAssignment;
  const today = todayIso();
  const latest = latestRecordIds(records?.items ?? []);
  const due = (records?.items ?? [])
    .filter((r) => latest.has(r.id))
    .map((r) => ({ record: r, status: dueStatus(r, true, vehicle.odometer?.readingKm ?? null, today) }))
    .sort((a, b) => URGENCY[a.status] - URGENCY[b.status] || (a.record.endDate ?? '9').localeCompare(b.record.endDate ?? '9'));
  const attention = due.filter((d) => d.status === 'overdue' || d.status === 'due_soon');
  const next = due[0];

  return (
    <section className="space-y-5">
      <BackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-primary" aria-hidden>
            <Car className="size-6" />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-2xl font-semibold tracking-tight">{vehicle.assetNo}</h1>
              <Badge variant={ASSET_STATUS_VARIANT[vehicle.status]} dot>
                {vehicle.status === 'assigned' ? 'With driver' : ASSET_STATUS_LABELS[vehicle.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {vehicle.name}
              {vehicle.brand || vehicle.model ? ` · ${[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => setEditing(true)}>
            <Pen className="size-4" />
            Edit
          </Button>
          {vehicle.status === 'assigned' ? (
            <Button size="lg" onClick={() => setReturning(true)}>
              <Undo2 className="size-4" />
              Record return
            </Button>
          ) : vehicle.status === 'available' ? (
            <Button size="lg" onClick={() => setAssigning(true)}>
              <UserPlus className="size-4" />
              Assign driver
            </Button>
          ) : null}
        </div>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Driver"
          value={driver?.employeeName ?? 'No driver'}
          hint={driver ? `Since ${formatExpenseDate(driver.assignedDate)}${driver.acknowledgedAt ? '' : ' · not confirmed'}` : 'Available to assign'}
          icon={UserPlus}
          tone={driver ? 'outstanding' : 'plain'}
          iconColor="blue"
          iconTile
        />
        <StatCard
          label="Odometer"
          value={vehicle.odometer ? formatKm(vehicle.odometer.readingKm) : '—'}
          hint={vehicle.odometer ? `As of ${formatExpenseDate(vehicle.odometer.readingDate)}` : 'No readings yet'}
          icon={Gauge}
          iconTile
        />
        <StatCard
          label="Next due"
          value={next ? next.record.serviceTypeName : '—'}
          hint={
            next
              ? [
                  DUE_STATUS_LABELS[next.status],
                  next.record.endDate ? formatExpenseDate(next.record.endDate) : null,
                  next.record.nextDueKm !== null ? formatKm(next.record.nextDueKm) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : 'No services logged'
          }
          icon={CalendarClock}
          tone={next?.status === 'overdue' ? 'overdue' : next?.status === 'due_soon' ? 'pending' : 'plain'}
          iconTile
        />
        <StatCard
          label="Spent this year"
          value={spend ? formatMoney(spend.thisYear.amount + spend.manualServiceCostThisYear) : '—'}
          hint={[
            vehicle.purchaseCost != null ? `Value ${formatMoney(vehicle.purchaseCost)}` : null,
            spend?.costPerKm != null ? `${formatMoney(spend.costPerKm)}/km` : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'No approved expenses yet'}
          icon={Wallet}
          iconTile
        />
      </section>

      {attention.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-status-warning px-4 py-3 text-sm text-status-warning-ink">
          <span className="font-semibold">Needs attention:</span>
          {attention.map(({ record, status }) => (
            <Badge key={record.id} variant={status === 'overdue' ? 'destructive' : 'warning'} dot>
              {record.serviceTypeName} {status === 'overdue' ? 'overdue' : 'due soon'}
            </Badge>
          ))}
        </div>
      ) : null}

      <Card className="gap-0 py-0" aria-label="Vehicle history">
        <div role="tablist" aria-label="Vehicle sections" className="flex flex-wrap border-b border-border px-5">
          {TABS.map(([id, label]) => {
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
        {tab === 'services' ? (
          <ServiceRecordsTab vehicle={vehicle} />
        ) : tab === 'expenses' ? (
          <VehicleExpensesTab vehicleId={vehicle.id} />
        ) : tab === 'odometer' ? (
          <OdometerTab vehicle={vehicle} />
        ) : tab === 'drivers' ? (
          <DriversTab vehicle={vehicle} />
        ) : (
          <DetailsTab vehicle={vehicle} />
        )}
      </Card>

      <AssetFormDialog
        open={editing}
        asset={vehicle}
        vehicle
        isSubmitting={updateAsset.isPending}
        onClose={() => setEditing(false)}
        onSubmit={(payload) => updateAsset.mutate({ id: vehicle.id, payload }, { onSuccess: () => setEditing(false) })}
      />
      <AssignAssetDialog
        asset={assigning ? vehicle : null}
        isSubmitting={assignAsset.isPending}
        onClose={() => setAssigning(false)}
        onSubmit={(payload) => assignAsset.mutate({ id: vehicle.id, payload }, { onSuccess: () => setAssigning(false) })}
      />
      <ReturnAssetDialog
        asset={returning ? vehicle : null}
        isSubmitting={returnAsset.isPending}
        onClose={() => setReturning(false)}
        onSubmit={(payload) => returnAsset.mutate({ id: vehicle.id, payload }, { onSuccess: () => setReturning(false) })}
      />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      href={ADMIN_ROUTES.VEHICLES}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Vehicles
    </Link>
  );
}

/** Who drove it and when, with km at hand-over and return. */
function DriversTab({ vehicle }: { vehicle: AssetDetail }) {
  if (vehicle.history.length === 0) {
    return <p className="m-5 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No drivers yet.</p>;
  }
  return (
    <Table className="min-w-[860px]">
      <TableHeader>
        <TableRow>
          <TableHead>Driver</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead className="text-right">Km out</TableHead>
          <TableHead className="text-right">Km in</TableHead>
          <TableHead className="text-right">Driven</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicle.history.map((h) => (
          <TableRow key={h.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {h.employeeName ?? '—'}
              {h.employeeCode ? <div className="text-xs font-normal text-muted-foreground">{h.employeeCode}</div> : null}
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatExpenseDate(h.assignedDate)}</TableCell>
            <TableCell className="whitespace-nowrap">
              {h.returnedDate ? formatExpenseDate(h.returnedDate) : <Badge variant="secondary">Current</Badge>}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap tabular-nums">{h.odometerOut !== null ? formatKm(h.odometerOut) : '—'}</TableCell>
            <TableCell className="text-right whitespace-nowrap tabular-nums">{h.odometerIn !== null ? formatKm(h.odometerIn) : '—'}</TableCell>
            <TableCell className="text-right whitespace-nowrap tabular-nums">
              {h.odometerOut !== null && h.odometerIn !== null ? formatKm(h.odometerIn - h.odometerOut) : '—'}
            </TableCell>
            <TableCell className="max-w-56 text-[13px] text-muted-foreground">
              {[h.notes, h.returnNotes && `Return: ${h.returnNotes}`].filter(Boolean).join(' · ') || '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Detail({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm font-medium break-words', mono && 'font-mono text-[13px]')}>{children}</dd>
    </div>
  );
}

function DetailsTab({ vehicle }: { vehicle: AssetDetail }) {
  const { addImage, removeImage } = useAssetMutations();
  return (
    <div className="flex flex-col gap-5 p-5">
      <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-3">
        <Detail label="Registration no." mono>
          {vehicle.assetNo}
        </Detail>
        <Detail label="Make / model">{[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || '—'}</Detail>
        <Detail label="Chassis no. (VIN)" mono>
          {vehicle.serialNo ?? '—'}
        </Detail>
        <Detail label="Condition">{ASSET_CONDITION_LABELS[vehicle.condition]}</Detail>
        <Detail label="Purchased">
          {vehicle.purchaseDate ? formatExpenseDate(vehicle.purchaseDate) : '—'}
          {vehicle.purchaseCost != null ? ` · ${formatMoney(vehicle.purchaseCost)}` : ''}
        </Detail>
        <Detail label="Warranty until">{vehicle.warrantyExpiry ? formatExpenseDate(vehicle.warrantyExpiry) : '—'}</Detail>
        <Detail label="Added">{formatExpenseDate(vehicle.createdAt.slice(0, 10))}</Detail>
        {vehicle.notes ? (
          <div className="sm:col-span-3">
            <dt className="text-[13px] text-muted-foreground">Comments</dt>
            <dd className="mt-0.5 text-sm whitespace-pre-line">{vehicle.notes}</dd>
          </div>
        ) : null}
      </dl>
      <section aria-labelledby="vehicle-photos">
        <h3 id="vehicle-photos" className="mb-2 text-sm font-semibold">
          Photos
        </h3>
        <AssetPhotos
          assetName={vehicle.name}
          images={vehicle.images}
          srcFor={(imageId) => API_ENDPOINTS.ASSETS.IMAGE(vehicle.id, imageId)}
          onAdd={(file) => addImage.mutate({ id: vehicle.id, file })}
          onRemove={(imageId) => removeImage.mutate({ id: vehicle.id, imageId })}
          adding={addImage.isPending}
          removingId={removeImage.isPending ? removeImage.variables?.imageId : null}
        />
      </section>
    </div>
  );
}
