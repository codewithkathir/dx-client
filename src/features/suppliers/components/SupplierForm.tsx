'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { CountrySelect } from '@/components/forms/CountrySelect';
import { FormField } from '@/components/forms/FormField';
import { SegmentedRadio } from '@/components/forms/SegmentedRadio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  supplierSchema,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplier.schema';
import { partyPhotoUrl } from '@/components/shared/PartyAvatar';
import { ProfilePhotoUpload } from '@/features/employees/components/ProfilePhotoUpload';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { Supplier, SupplierPayload, PartyPhotoChange } from '@/types/finance.types';
import { DEFAULT_COUNTRY } from '@/lib/countries';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

interface SupplierFormProps {
  supplier?: Supplier;
  isSubmitting: boolean;
  onSubmit: (payload: SupplierPayload, photo: PartyPhotoChange) => void;
  onCancel: () => void;
}

/** Empty optional fields are sent as null so they can be cleared. */
function toPayload(values: SupplierFormValues): SupplierPayload {
  const orNull = (value: string) => value.trim() || null;
  return {
    companyName: values.companyName,
    contactName1: orNull(values.contactName1),
    email: orNull(values.email),
    phone1: orNull(values.phone1),
    whatsappNo: orNull(values.whatsappNo),
    companyAddress: orNull(values.companyAddress),
    cityState: orNull(values.cityState),
    country: orNull(values.country),
    status: values.status,
    comments: orNull(values.comments),
  };
}

export function SupplierForm({ supplier, isSubmitting, onSubmit, onCancel }: SupplierFormProps) {
  const { register, handleSubmit, formState } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      companyName: supplier?.companyName ?? '',
      contactName1: supplier?.contactName1 ?? '',
      email: supplier?.email ?? '',
      phone1: supplier?.phone1 ?? '',
      whatsappNo: supplier?.whatsappNo ?? '',
      companyAddress: supplier?.companyAddress ?? '',
      cityState: supplier?.cityState ?? '',
      country: supplier?.country ?? DEFAULT_COUNTRY,
      status: supplier?.status ?? 'active',
      comments: supplier?.comments ?? '',
    },
  });
  const { errors } = formState;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const hasSavedPhoto = Boolean(supplier?.photo) && !removePhoto;

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(toPayload(values), { file: photoFile, remove: removePhoto }))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ProfilePhotoUpload
              label="Picture"
              value={photoFile}
              onChange={setPhotoFile}
              hasExistingPhoto={hasSavedPhoto}
              existingPhotoFetchUrl={supplier ? partyPhotoUrl(API_ENDPOINTS.SUPPLIERS.PHOTO(supplier.id), supplier.photo) : null}
              onRemoveExisting={() => setRemovePhoto(true)}
            />
        </div>
        <FormField label="Company name" htmlFor="companyName" required error={errors.companyName?.message} className="sm:col-span-2">
          <Input id="companyName" {...register('companyName')} />
        </FormField>
        <FormField label="Contact name" htmlFor="contactName1" error={errors.contactName1?.message}>
          <Input id="contactName1" {...register('contactName1')} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="phone1" error={errors.phone1?.message}>
          <Input id="phone1" type="tel" {...register('phone1')} />
        </FormField>
        <FormField label="WhatsApp" htmlFor="whatsappNo" error={errors.whatsappNo?.message}>
          <Input id="whatsappNo" type="tel" {...register('whatsappNo')} />
        </FormField>
        <FormField label="City / State" htmlFor="cityState" error={errors.cityState?.message}>
          <Input id="cityState" {...register('cityState')} />
        </FormField>
        <FormField label="Country" htmlFor="country" error={errors.country?.message}>
          <CountrySelect
            id="country"
            allowEmpty
            savedValue={supplier?.country}
            {...register('country', { deps: ['phone1', 'whatsappNo'] })}
          />
        </FormField>
        <FormField label="Address" htmlFor="companyAddress" error={errors.companyAddress?.message} className="sm:col-span-2">
          <Textarea id="companyAddress" rows={2} {...register('companyAddress')} />
        </FormField>
        <FormField label="Status" htmlFor="status" required error={errors.status?.message}>
          <SegmentedRadio
          id="status"
          label="Status"
          registration={register('status')}
          options={STATUS_OPTIONS}
        />
        </FormField>
        <FormField label="Comments" htmlFor="comments" error={errors.comments?.message} className="sm:col-span-2">
          <Textarea id="comments" rows={2} {...register('comments')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button loading={isSubmitting} size="lg" type="submit" disabled={isSubmitting}>
          {supplier ? 'Save changes' : 'Save supplier'}
        </Button>
      </div>
    </form>
  );
}
