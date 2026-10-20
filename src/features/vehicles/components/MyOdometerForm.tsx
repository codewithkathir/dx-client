'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Gauge } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useReportMyOdometer } from '@/features/vehicles/hooks/useVehicles';
import { myOdometerFormSchema, type MyOdometerFormValues } from '@/features/vehicles/schemas/vehicle.schema';
import type { MyAsset } from '@/types/asset.types';

/** Employee app: the driver reports today's km for the vehicle they hold. */
export function MyOdometerForm({ asset }: { asset: MyAsset }) {
  const formId = useId();
  const report = useReportMyOdometer();
  const { register, handleSubmit, formState, reset } = useForm<MyOdometerFormValues>({
    resolver: zodResolver(myOdometerFormSchema),
    defaultValues: { readingKm: '', notes: '' },
  });
  const { errors } = formState;

  return (
    <form
      noValidate
      className="flex flex-col gap-3 rounded-[14px] border border-border p-4"
      onSubmit={handleSubmit((v) =>
        report.mutate(
          { assignmentId: asset.assignmentId, payload: { readingKm: Number(v.readingKm), notes: v.notes.trim() || null } },
          { onSuccess: () => reset() },
        ),
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Gauge className="size-4 text-primary" aria-hidden />
        Update odometer
      </div>
      <p className="text-[13px] text-muted-foreground">
        {asset.odometer
          ? `Last reading ${formatKm(asset.odometer.readingKm)} on ${formatExpenseDate(asset.odometer.readingDate)}.`
          : 'No reading yet.'}{' '}
        Please update it at least once a week.
      </p>
      <FormField label="Today's reading (km)" htmlFor={`${formId}-km`} required error={errors.readingKm?.message}>
        <Input id={`${formId}-km`} inputMode="numeric" className="h-12 text-base" placeholder="e.g. 45200" {...register('readingKm')} />
      </FormField>
      <Button type="submit" size="lg" className="h-12 w-full text-[15px]" loading={report.isPending}>
        Save reading
      </Button>
    </form>
  );
}
