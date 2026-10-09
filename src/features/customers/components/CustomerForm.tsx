'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  customerSchema,
  type CustomerFormValues,
} from '@/features/customers/schemas/customer.schema';
import type { Customer, CustomerPayload } from '@/types/finance.types';

interface CustomerFormProps {
  customer?: Customer;
  isSubmitting: boolean;
  onSubmit: (payload: CustomerPayload) => void;
  onCancel: () => void;
}

/** Empty optional fields are sent as null so they can be cleared. */
function toPayload(values: CustomerFormValues): CustomerPayload {
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
    trn: orNull(values.trn),
    creditLimit: values.creditLimit ? Number(values.creditLimit) : null,
    paymentTerms: orNull(values.paymentTerms),
    status: values.status,
    comments: orNull(values.comments),
  };
}

export function CustomerForm({ customer, isSubmitting, onSubmit, onCancel }: CustomerFormProps) {
  const { register, handleSubmit, formState } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: customer?.companyName ?? '',
      contactName1: customer?.contactName1 ?? '',
      email: customer?.email ?? '',
      phone1: customer?.phone1 ?? '',
      whatsappNo: customer?.whatsappNo ?? '',
      companyAddress: customer?.companyAddress ?? '',
      cityState: customer?.cityState ?? '',
      country: customer?.country ?? 'UAE',
      trn: customer?.trn ?? '',
      creditLimit: customer?.creditLimit != null ? String(customer.creditLimit) : '',
      paymentTerms: customer?.paymentTerms ?? '',
      status: customer?.status ?? 'active',
      comments: customer?.comments ?? '',
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
        <FormField label="TRN" htmlFor="trn" error={errors.trn?.message}>
          <Input id="trn" inputMode="numeric" maxLength={15} placeholder="15-digit tax registration no." {...register('trn')} />
        </FormField>
        <FormField label="Payment terms" htmlFor="paymentTerms" error={errors.paymentTerms?.message}>
          <Input id="paymentTerms" placeholder="e.g. Net 30" {...register('paymentTerms')} />
        </FormField>
        <FormField label="Credit limit (AED)" htmlFor="creditLimit" error={errors.creditLimit?.message}>
          <Input id="creditLimit" type="number" inputMode="decimal" step="0.01" min="0" {...register('creditLimit')} />
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
          {isSubmitting ? 'Saving…' : customer ? 'Save changes' : 'Add customer'}
        </Button>
      </div>
    </form>
  );
}
