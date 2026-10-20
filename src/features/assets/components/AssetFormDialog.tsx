'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Car, Package } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_OPTIONS,
  UNASSIGNED_STATUS_OPTIONS,
} from '@/features/assets/constants/asset.constants';
import { assetFormSchema, type AssetFormValues } from '@/features/assets/schemas/asset.schema';
import type { Asset, AssetCategory, AssetCondition, AssetPayload, UnassignedAssetStatus } from '@/types/asset.types';
import { todayIso } from '@/utils/money.utils';

interface AssetFormDialogProps {
  open: boolean;
  asset?: Asset;
  /** Vehicle management: category fixed, the registration number is the asset number. */
  vehicle?: boolean;
  isSubmitting: boolean;
  onSubmit: (payload: AssetPayload) => void;
  onClose: () => void;
}

const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim());

function toPayload(values: AssetFormValues, isEdit: boolean, assigned: boolean): AssetPayload {
  return {
    ...(values.assetNo.trim() ? { assetNo: values.assetNo.trim() } : {}),
    name: values.name.trim(),
    category: values.category as AssetCategory,
    brand: blankToNull(values.brand),
    model: blankToNull(values.model),
    serialNo: blankToNull(values.serialNo),
    purchaseDate: blankToNull(values.purchaseDate),
    purchaseCost: values.purchaseCost.trim() === '' ? null : Number(values.purchaseCost),
    warrantyExpiry: blankToNull(values.warrantyExpiry),
    condition: values.condition as AssetCondition,
    // An assigned asset's status only changes through assign / return.
    ...(isEdit && assigned ? {} : { status: values.status as UnassignedAssetStatus }),
    notes: blankToNull(values.notes),
  };
}

/** Add or edit an asset. */
export function AssetFormDialog(props: AssetFormDialogProps) {
  if (!props.open) return null;
  return <AssetFormInner {...props} />;
}

function AssetFormInner({ asset, vehicle = false, isSubmitting, onSubmit, onClose }: AssetFormDialogProps) {
  const formId = useId();
  const isEdit = Boolean(asset);
  const assigned = asset?.status === 'assigned';
  const { register, handleSubmit, formState, control, setError } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name ?? '',
      assetNo: asset?.assetNo ?? '',
      category: asset?.category ?? (vehicle ? 'vehicle' : 'laptop'),
      brand: asset?.brand ?? '',
      model: asset?.model ?? '',
      serialNo: asset?.serialNo ?? '',
      purchaseDate: asset?.purchaseDate ?? '',
      purchaseCost: asset?.purchaseCost != null ? asset.purchaseCost.toFixed(2) : '',
      warrantyExpiry: asset?.warrantyExpiry ?? '',
      condition: asset?.condition ?? 'new',
      status: asset && asset.status !== 'assigned' ? asset.status : 'available',
      notes: asset?.notes ?? '',
    },
  });
  const { errors } = formState;
  const purchaseDate = useWatch({ control, name: 'purchaseDate' });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[720px]">
        <DialogIconHeader
          icon={vehicle ? Car : Package}
          title={isEdit ? `Edit ${asset?.name}` : vehicle ? 'Add vehicle' : 'Add asset'}
          description={
            vehicle
              ? 'A company vehicle. Assign it to a driver and log its services, insurance and odometer.'
              : 'Company equipment you hand out to employees: laptops, phones, vehicles, cards and more.'
          }
        />
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit((v) => {
            if (vehicle && !v.assetNo.trim()) {
              setError('assetNo', { message: 'Registration number is required' });
              return;
            }
            onSubmit(toPayload(v, isEdit, assigned));
          })}
          className="flex min-h-0 flex-col gap-[18px] overflow-y-auto px-6 py-5"
        >
          <FormSection title={vehicle ? 'Vehicle' : 'Asset'}>
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Name" htmlFor={`${formId}-name`} required error={errors.name?.message} className="sm:col-span-2">
                <Input
                  id={`${formId}-name`}
                  placeholder={vehicle ? 'e.g. Toyota Hiace' : 'e.g. MacBook Pro 14"'}
                  {...register('name')}
                />
              </FormField>
              {vehicle ? null : (
                <FormField label="Category" htmlFor={`${formId}-cat`} required error={errors.category?.message}>
                  <Select id={`${formId}-cat`} {...register('category')}>
                    {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {ASSET_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
              <FormField
                label={vehicle ? 'Registration no.' : 'Asset tag'}
                htmlFor={`${formId}-no`}
                required={vehicle}
                error={errors.assetNo?.message}
              >
                <Input
                  id={`${formId}-no`}
                  placeholder={vehicle ? 'e.g. DXB-A-12345' : 'Automatic (AST-2026-0001)'}
                  className="font-mono"
                  {...register('assetNo')}
                />
              </FormField>
              <FormField label={vehicle ? 'Make' : 'Brand'} htmlFor={`${formId}-brand`} error={errors.brand?.message}>
                <Input id={`${formId}-brand`} placeholder={vehicle ? 'e.g. Toyota' : 'e.g. Apple'} {...register('brand')} />
              </FormField>
              <FormField label="Model" htmlFor={`${formId}-model`} error={errors.model?.message}>
                <Input id={`${formId}-model`} placeholder={vehicle ? 'e.g. Hiace 2024' : 'e.g. M3 Pro'} {...register('model')} />
              </FormField>
              <FormField
                label={vehicle ? 'Chassis no. (VIN)' : 'Serial no.'}
                htmlFor={`${formId}-serial`}
                error={errors.serialNo?.message}
                className={vehicle ? undefined : 'sm:col-span-2'}
              >
                <Input id={`${formId}-serial`} className="font-mono" {...register('serialNo')} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Purchase & warranty">
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-3">
              <FormField label="Purchase date" htmlFor={`${formId}-pdate`} error={errors.purchaseDate?.message}>
                <Controller
                  control={control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <DatePicker
                      id={`${formId}-pdate`}
                      max={todayIso()}
                      placeholder="Not set"
                      clearable
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormField>
              <FormField label="Cost" htmlFor={`${formId}-cost`} error={errors.purchaseCost?.message}>
                <MoneyInput id={`${formId}-cost`} min="0" {...register('purchaseCost')} />
              </FormField>
              <FormField label="Warranty until" htmlFor={`${formId}-warranty`} error={errors.warrantyExpiry?.message}>
                <Controller
                  control={control}
                  name="warrantyExpiry"
                  render={({ field }) => (
                    <DatePicker
                      id={`${formId}-warranty`}
                      min={purchaseDate || undefined}
                      placeholder="Not set"
                      clearable
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="State">
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Condition" htmlFor={`${formId}-cond`}>
                <Select id={`${formId}-cond`} {...register('condition')}>
                  {ASSET_CONDITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Status" htmlFor={`${formId}-status`}>
                {assigned ? (
                  <p className="flex h-9 items-center text-sm text-muted-foreground">Assigned — record its return to change this.</p>
                ) : (
                  <Select id={`${formId}-status`} {...register('status')}>
                    {UNASSIGNED_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message} className="sm:col-span-2">
                <Textarea id={`${formId}-notes`} className="min-h-16" placeholder="Accessories included, location, anything useful" {...register('notes')} />
              </FormField>
            </div>
          </FormSection>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            {isEdit ? 'Save changes' : vehicle ? 'Add vehicle' : 'Add asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
