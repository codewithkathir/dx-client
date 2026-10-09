'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  supplierSchema,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplier.schema';
import type { Supplier, SupplierPayload } from '@/types/finance.types';

interface SupplierFormProps {
  supplier?: Supplier;
  isSubmitting: boolean;
  onSubmit: (payload: SupplierPayload) => void;
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
      country: supplier?.country ?? 'UAE',
      status: supplier?.status ?? 'active',
      comments: supplier?.comments ?? '',
    },
  });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company name" htmlFor="companyName" required error={errors.companyName?.message} className="sm:col-span-2">
          <Input id="companyName" {...register('companyName')} />
        </FormField>
        <FormField label="Contact person" htmlFor="contactName1" error={errors.contactName1?.message}>
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
          <Input id="country" {...register('country')} />
        </FormField>
        <FormField label="Address" htmlFor="companyAddress" error={errors.companyAddress?.message} className="sm:col-span-2">
          <Textarea id="companyAddress" rows={2} {...register('companyAddress')} />
        </FormField>
        <FormField label="Status" htmlFor="status" required error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
        <FormField label="Comments" htmlFor="comments" error={errors.comments?.message} className="sm:col-span-2">
          <Textarea id="comments" rows={2} {...register('comments')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : supplier ? 'Save changes' : 'Add supplier'}
        </Button>
      </div>
    </form>
  );
}
