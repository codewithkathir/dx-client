'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Wrench } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ASSET_CATEGORY_LABELS } from '@/features/assets/constants/asset.constants';
import { serviceTypeFormSchema, type ServiceTypeFormValues } from '@/features/vehicles/schemas/vehicle.schema';
import type { AssetCategory } from '@/types/asset.types';
import type { ServiceType, ServiceTypePayload, ServiceTypeStatus } from '@/types/vehicle.types';

interface ServiceTypeDialogProps {
  open: boolean;
  serviceType?: ServiceType;
  isSubmitting: boolean;
  onSubmit: (payload: ServiceTypePayload) => void;
  onClose: () => void;
}

export function ServiceTypeDialog(props: ServiceTypeDialogProps) {
  if (!props.open) return null;
  return <ServiceTypeInner {...props} />;
}

function ServiceTypeInner({ serviceType, isSubmitting, onSubmit, onClose }: ServiceTypeDialogProps) {
  const formId = useId();
  const { register, handleSubmit, formState } = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeFormSchema),
    defaultValues: {
      name: serviceType?.name ?? '',
      code: serviceType?.code ?? '',
      category: serviceType ? (serviceType.category ?? '') : 'vehicle',
      intervalDays: serviceType?.intervalDays != null ? String(serviceType.intervalDays) : '',
      intervalKm: serviceType?.intervalKm != null ? String(serviceType.intervalKm) : '',
      status: serviceType?.status ?? 'active',
    },
  });
  const { errors } = formState;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[520px]">
        <DialogIconHeader
          icon={Wrench}
          title={serviceType ? `Edit ${serviceType.name}` : 'Add service type'}
          description="Something you log against a vehicle or asset, and how often it falls due."
        />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) =>
            onSubmit({
              name: v.name.trim(),
              code: v.code.trim().toUpperCase(),
              category: (v.category || null) as AssetCategory | null,
              intervalDays: v.intervalDays ? Number(v.intervalDays) : null,
              intervalKm: v.intervalKm ? Number(v.intervalKm) : null,
              status: v.status as ServiceTypeStatus,
            }),
          )}
        >
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Name" htmlFor={`${formId}-name`} required error={errors.name?.message}>
              <Input id={`${formId}-name`} placeholder="e.g. Oil change" {...register('name')} />
            </FormField>
            <FormField label="Code" htmlFor={`${formId}-code`} required error={errors.code?.message}>
              <Input id={`${formId}-code`} placeholder="e.g. OIL_CHANGE" className="font-mono uppercase" {...register('code')} />
            </FormField>
            <FormField label="Applies to" htmlFor={`${formId}-cat`}>
              <Select id={`${formId}-cat`} {...register('category')}>
                <option value="">All asset types</option>
                {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {ASSET_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" htmlFor={`${formId}-status`}>
              <Select id={`${formId}-status`} {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>
            <FormField label="Due every (days)" htmlFor={`${formId}-days`} error={errors.intervalDays?.message}>
              <Input id={`${formId}-days`} inputMode="numeric" placeholder="e.g. 90" {...register('intervalDays')} />
            </FormField>
            <FormField label="Due every (km)" htmlFor={`${formId}-km`} error={errors.intervalKm?.message}>
              <Input id={`${formId}-km`} inputMode="numeric" placeholder="e.g. 5000" {...register('intervalKm')} />
            </FormField>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave both intervals empty for one-off work. With both set, it&apos;s due at whichever comes first.
          </p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            {serviceType ? 'Save changes' : 'Add service type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
