'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Wrench } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminWhomDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useServiceTypes } from '@/features/vehicles/hooks/useVehicles';
import { serviceRecordFormSchema, type ServiceRecordFormValues } from '@/features/vehicles/schemas/vehicle.schema';
import type { Asset } from '@/types/asset.types';
import type { LatestOdometer, ServiceRecord, ServiceRecordPayload } from '@/types/vehicle.types';
import { addDaysIso, todayIso } from '@/utils/money.utils';

interface ServiceRecordDialogProps {
  open: boolean;
  vehicle: Asset;
  /** Latest odometer reading, to warn before saving a lower one. */
  lastReading: LatestOdometer | null;
  record?: ServiceRecord;
  isSubmitting: boolean;
  onSubmit: (payload: ServiceRecordPayload) => void;
  onClose: () => void;
}

const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim());

/** Log an oil change, service, insurance, registration… with when it's next due. */
export function ServiceRecordDialog(props: ServiceRecordDialogProps) {
  if (!props.open) return null;
  return <ServiceRecordInner {...props} />;
}

function ServiceRecordInner({ vehicle, lastReading, record, isSubmitting, onSubmit, onClose }: ServiceRecordDialogProps) {
  const formId = useId();
  const isEdit = Boolean(record);
  const { data: types } = useServiceTypes({ category: vehicle.category, status: 'active' });
  const { data: employees = [] } = useAdminWhomDropdown();
  const { register, handleSubmit, formState, control } = useForm<ServiceRecordFormValues>({
    resolver: zodResolver(serviceRecordFormSchema),
    defaultValues: {
      serviceTypeId: record ? String(record.serviceTypeId) : '',
      startDate: record?.startDate ?? todayIso(),
      endDate: record?.endDate ?? '',
      odometerKm: record?.odometerKm != null ? String(record.odometerKm) : '',
      nextDueKm: record?.nextDueKm != null ? String(record.nextDueKm) : '',
      employeeId: record?.employeeId ? String(record.employeeId) : (vehicle.currentAssignment?.employeeId.toString() ?? ''),
      cost: record?.cost != null ? record.cost.toFixed(2) : '',
      referenceNo: record?.referenceNo ?? '',
      notes: record?.notes ?? '',
      allowOdometerDecrease: false,
    },
  });
  const { errors } = formState;
  const [typeId, startDate, odometerKm] = useWatch({ control, name: ['serviceTypeId', 'startDate', 'odometerKm'] });

  // On a new record, empty due fields are filled by the server from the type's interval; show what that will be.
  const type = types?.items.find((t) => String(t.id) === typeId);
  const defaultEnd = !isEdit && type?.intervalDays && startDate ? addDaysIso(startDate, type.intervalDays) : null;
  const defaultKm = !isEdit && type?.intervalKm && /^\d+$/.test(odometerKm) ? Number(odometerKm) + type.intervalKm : null;
  // Backdated records may be lower; only a same-or-later date below the last reading needs the override.
  const odometerLow =
    lastReading !== null &&
    /^\d+$/.test(odometerKm) &&
    Number(odometerKm) !== record?.odometerKm &&
    Number(odometerKm) < lastReading.readingKm &&
    startDate >= lastReading.readingDate;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[640px]">
        <DialogIconHeader
          icon={Wrench}
          title={isEdit ? `Edit ${record?.serviceTypeName}` : 'Add service record'}
          description={`${vehicle.assetNo} · ${vehicle.name}`}
        />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) => {
            const payload: ServiceRecordPayload = {
              serviceTypeId: Number(v.serviceTypeId),
              startDate: v.startDate,
              employeeId: v.employeeId ? Number(v.employeeId) : null,
              odometerKm: v.odometerKm ? Number(v.odometerKm) : null,
              cost: v.cost ? Number(v.cost) : null,
              referenceNo: blankToNull(v.referenceNo),
              notes: blankToNull(v.notes),
              ...(v.allowOdometerDecrease ? { allowOdometerDecrease: true } : {}),
            };
            // Left empty on create → server defaults; on edit → cleared.
            if (v.endDate || isEdit) payload.endDate = v.endDate || null;
            if (v.nextDueKm || isEdit) payload.nextDueKm = v.nextDueKm ? Number(v.nextDueKm) : null;
            onSubmit(payload);
          })}
        >
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="What was done" htmlFor={`${formId}-type`} required error={errors.serviceTypeId?.message}>
              <Select id={`${formId}-type`} {...register('serviceTypeId')}>
                <option value="">Select…</option>
                {types?.items.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Date done / issued" htmlFor={`${formId}-start`} required error={errors.startDate?.message}>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    id={`${formId}-start`}
                    max={todayIso()}
                    aria-invalid={errors.startDate ? true : undefined}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
            <FormField label="Odometer (km)" htmlFor={`${formId}-km`} error={errors.odometerKm?.message}>
              <Input id={`${formId}-km`} inputMode="numeric" placeholder="e.g. 45200" {...register('odometerKm')} />
              {lastReading ? (
                <p className="text-xs text-muted-foreground">
                  Last reading {formatKm(lastReading.readingKm)} on {formatExpenseDate(lastReading.readingDate)}
                </p>
              ) : null}
            </FormField>
            <FormField label="Handled by" htmlFor={`${formId}-emp`}>
              <Select id={`${formId}-emp`} {...register('employeeId')}>
                <option value="">—</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.empName}
                    {e.employeeCode ? ` (${e.employeeCode})` : ''}
                  </option>
                ))}
              </Select>
            </FormField>
            {odometerLow ? (
              <label className="flex items-start gap-2 rounded-lg bg-status-warning px-3 py-2 text-[13px] text-status-warning-ink sm:col-span-2">
                <input type="checkbox" className="mt-0.5" {...register('allowOdometerDecrease')} />
                Lower than the last reading. Tick if the odometer was replaced or reset.
              </label>
            ) : null}
          </div>

          <div className="grid gap-x-4 gap-y-3.5 rounded-xl border border-border p-4 sm:grid-cols-2">
            <FormField label="Next due / expiry date" htmlFor={`${formId}-end`} error={errors.endDate?.message}>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    id={`${formId}-end`}
                    min={startDate || undefined}
                    placeholder={defaultEnd ? `Auto: ${formatExpenseDate(defaultEnd)}` : 'No due date'}
                    clearable
                    aria-invalid={errors.endDate ? true : undefined}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {defaultEnd ? <p className="text-xs text-muted-foreground">Empty = every {type?.intervalDays} days</p> : null}
            </FormField>
            <FormField label="Next due at (km)" htmlFor={`${formId}-next`} error={errors.nextDueKm?.message}>
              <Input
                id={`${formId}-next`}
                inputMode="numeric"
                placeholder={defaultKm ? `Auto: ${defaultKm.toLocaleString('en-US')}` : 'Not km-based'}
                {...register('nextDueKm')}
              />
              {defaultKm ? (
                <p className="text-xs text-muted-foreground">Empty = every {type?.intervalKm?.toLocaleString('en-US')} km</p>
              ) : null}
            </FormField>
          </div>

          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Cost" htmlFor={`${formId}-cost`} error={errors.cost?.message}>
              <MoneyInput id={`${formId}-cost`} min="0" {...register('cost')} />
            </FormField>
            <FormField label="Reference no." htmlFor={`${formId}-ref`} error={errors.referenceNo?.message}>
              <Input id={`${formId}-ref`} placeholder="Invoice, policy or Mulkiya no." {...register('referenceNo')} />
            </FormField>
            <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message} className="sm:col-span-2">
              <Textarea id={`${formId}-notes`} className="min-h-14" placeholder="Garage, parts replaced, anything useful" {...register('notes')} />
            </FormField>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
