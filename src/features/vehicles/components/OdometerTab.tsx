'use client';

import { useId, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Gauge, Plus, Trash } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { FormField } from '@/components/forms/FormField';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminWhomDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { ODOMETER_SOURCE_LABELS, formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useOdometerMutations, useOdometerReadings } from '@/features/vehicles/hooks/useVehicles';
import { odometerFormSchema, type OdometerFormValues } from '@/features/vehicles/schemas/vehicle.schema';
import type { AssetDetail } from '@/types/asset.types';
import type { OdometerReading, OdometerReadingPayload } from '@/types/vehicle.types';
import { todayIso } from '@/utils/money.utils';

/** Every km reading for a vehicle, from services, hand-overs, drivers and admins. */
export function OdometerTab({ vehicle }: { vehicle: AssetDetail }) {
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<OdometerReading | null>(null);
  const { data, isLoading, isError, error, refetch } = useOdometerReadings(vehicle.id, page);
  const { addReading, deleteReading } = useOdometerMutations(vehicle.id);
  const items = data?.items ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">
          Readings come from service records, hand-overs, the driver&apos;s app and entries here. The newest one is the current km.
        </p>
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add reading
        </Button>
      </div>

      <div className="border-t border-border">
        {isError ? (
          <div className="p-6">
            <ErrorPanel title="Failed to load readings" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableRowsSkeleton rows={5} />
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No odometer readings" description="Add one now, or record the km when assigning a driver or logging a service." />
          </div>
        ) : (
          <Table className="min-w-[760px] animate-in fade-in-0 duration-300">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Odometer</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Driver / by</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{formatExpenseDate(r.readingDate)}</TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">{formatKm(r.readingKm)}</TableCell>
                  <TableCell>
                    <Badge variant={r.source === 'employee' ? 'secondary' : 'muted'}>{ODOMETER_SOURCE_LABELS[r.source]}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{r.employeeName ?? r.createdByName ?? '—'}</TableCell>
                  <TableCell className="max-w-56 truncate text-[13px] text-muted-foreground">{r.notes ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {r.source === 'service' || r.source === 'expense' ? (
                      <span className="text-xs text-muted-foreground">
                        {r.expenseId ? `From claim #${r.expenseId}` : 'Edit the service record'}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete reading from ${formatExpenseDate(r.readingDate)}`}
                        onClick={() => setDeleting(r)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {data?.meta && items.length > 0 ? <TablePagination meta={data.meta} onPageChange={setPage} /> : null}

      {adding ? (
        <OdometerReadingDialog
          vehicle={vehicle}
          isSubmitting={addReading.isPending}
          onClose={() => setAdding(false)}
          onSubmit={(payload) => addReading.mutate(payload, { onSuccess: () => setAdding(false) })}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete reading"
        description={`Delete the ${deleting ? formatKm(deleting.readingKm) : ''} reading from ${deleting ? formatExpenseDate(deleting.readingDate) : ''}?`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteReading.isPending}
        onConfirm={() => deleting && deleteReading.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

interface OdometerReadingDialogProps {
  vehicle: AssetDetail;
  isSubmitting: boolean;
  onSubmit: (payload: OdometerReadingPayload) => void;
  onClose: () => void;
}

function OdometerReadingDialog({ vehicle, isSubmitting, onSubmit, onClose }: OdometerReadingDialogProps) {
  const formId = useId();
  const last = vehicle.odometer;
  const { data: employees = [] } = useAdminWhomDropdown();
  const { register, handleSubmit, formState, control } = useForm<OdometerFormValues>({
    resolver: zodResolver(odometerFormSchema),
    defaultValues: {
      readingKm: '',
      readingDate: todayIso(),
      employeeId: vehicle.currentAssignment ? String(vehicle.currentAssignment.employeeId) : '',
      notes: '',
      allowDecrease: false,
    },
  });
  const { errors } = formState;
  const [readingKm, readingDate] = useWatch({ control, name: ['readingKm', 'readingDate'] });
  const lower = last !== null && /^\d+$/.test(readingKm) && Number(readingKm) < last.readingKm && readingDate >= last.readingDate;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[480px]">
        <DialogIconHeader
          icon={Gauge}
          title="Add odometer reading"
          description={last ? `Last: ${formatKm(last.readingKm)} on ${formatExpenseDate(last.readingDate)}` : vehicle.assetNo}
        />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) =>
            onSubmit({
              readingKm: Number(v.readingKm),
              readingDate: v.readingDate,
              employeeId: v.employeeId ? Number(v.employeeId) : null,
              notes: v.notes.trim() || null,
              ...(v.allowDecrease ? { allowDecrease: true } : {}),
            }),
          )}
        >
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Odometer (km)" htmlFor={`${formId}-km`} required error={errors.readingKm?.message}>
              <Input id={`${formId}-km`} inputMode="numeric" autoFocus placeholder="e.g. 45200" {...register('readingKm')} />
            </FormField>
            <FormField label="Date" htmlFor={`${formId}-date`} required error={errors.readingDate?.message}>
              <Controller
                control={control}
                name="readingDate"
                render={({ field }) => (
                  <DatePicker id={`${formId}-date`} max={todayIso()} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            </FormField>
            <FormField label="Driver" htmlFor={`${formId}-emp`} className="sm:col-span-2">
              <Select id={`${formId}-emp`} {...register('employeeId')}>
                <option value="">—</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.empName}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message} className="sm:col-span-2">
              <Input id={`${formId}-notes`} placeholder="e.g. Monthly check" {...register('notes')} />
            </FormField>
            {lower ? (
              <label className="flex items-start gap-2 rounded-lg bg-status-warning px-3 py-2 text-[13px] text-status-warning-ink sm:col-span-2">
                <input type="checkbox" className="mt-0.5" {...register('allowDecrease')} />
                Lower than the last reading. Tick if the odometer was replaced or reset.
              </label>
            ) : null}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            Add reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
