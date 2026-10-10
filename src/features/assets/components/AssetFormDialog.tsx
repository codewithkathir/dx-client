'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Package } from 'lucide-react';

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

interface AssetFormDialogProps {
  open: boolean;
  asset?: Asset;
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

function AssetFormInner({ asset, isSubmitting, onSubmit, onClose }: AssetFormDialogProps) {
  const formId = useId();
  const isEdit = Boolean(asset);
  const assigned = asset?.status === 'assigned';
  const { register, handleSubmit, formState } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name ?? '',
      assetNo: asset?.assetNo ?? '',
      category: asset?.category ?? 'laptop',
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

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[720px]">
        <DialogIconHeader
          icon={Package}
          title={isEdit ? `Edit ${asset?.name}` : 'Add asset'}
          description="Company equipment you hand out to employees: laptops, phones, vehicles, cards and more."
        />
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit((v) => onSubmit(toPayload(v, isEdit, assigned)))}
          className="flex min-h-0 flex-col gap-[18px] overflow-y-auto px-6 py-5"
        >
          <FormSection title="Asset">
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Name" htmlFor={`${formId}-name`} required error={errors.name?.message} className="sm:col-span-2">
                <Input id={`${formId}-name`} placeholder='e.g. MacBook Pro 14"' {...register('name')} />
              </FormField>
              <FormField label="Category" htmlFor={`${formId}-cat`} required error={errors.category?.message}>
                <Select id={`${formId}-cat`} {...register('category')}>
                  {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {ASSET_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Asset tag" htmlFor={`${formId}-no`} error={errors.assetNo?.message}>
                <Input id={`${formId}-no`} placeholder="Automatic (AST-2026-0001)" className="font-mono" {...register('assetNo')} />
              </FormField>
              <FormField label="Brand" htmlFor={`${formId}-brand`} error={errors.brand?.message}>
                <Input id={`${formId}-brand`} placeholder="e.g. Apple" {...register('brand')} />
              </FormField>
              <FormField label="Model" htmlFor={`${formId}-model`} error={errors.model?.message}>
                <Input id={`${formId}-model`} placeholder="e.g. M3 Pro" {...register('model')} />
              </FormField>
              <FormField label="Serial no." htmlFor={`${formId}-serial`} error={errors.serialNo?.message} className="sm:col-span-2">
                <Input id={`${formId}-serial`} className="font-mono" {...register('serialNo')} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Purchase & warranty">
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-3">
              <FormField label="Purchase date" htmlFor={`${formId}-pdate`} error={errors.purchaseDate?.message}>
                <Input id={`${formId}-pdate`} type="date" {...register('purchaseDate')} />
              </FormField>
              <FormField label="Cost" htmlFor={`${formId}-cost`} error={errors.purchaseCost?.message}>
                <MoneyInput id={`${formId}-cost`} min="0" {...register('purchaseCost')} />
              </FormField>
              <FormField label="Warranty until" htmlFor={`${formId}-warranty`} error={errors.warrantyExpiry?.message}>
                <Input id={`${formId}-warranty`} type="date" {...register('warrantyExpiry')} />
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
            {isEdit ? 'Save changes' : 'Add asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
