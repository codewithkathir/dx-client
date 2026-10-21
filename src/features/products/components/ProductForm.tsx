'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { SegmentedRadio } from '@/components/forms/SegmentedRadio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { productSchema, type ProductFormInput, type ProductFormValues } from '@/features/products/schemas/product.schema';
import type { Product, ProductPayload } from '@/types/product.types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

/** Common units; any other unit can be typed. */
const UNIT_SUGGESTIONS = ['pcs', 'kg', 'g', 'ltr', 'box', 'ctn', 'bag', 'pack', 'hour', 'day', 'trip', 'service'];

interface ProductFormProps {
  product?: Product;
  isSubmitting: boolean;
  onSubmit: (payload: ProductPayload) => void;
  onCancel: () => void;
}

function toPayload(values: ProductFormValues): ProductPayload {
  const orNull = (value: string) => value.trim() || null;
  return {
    code: orNull(values.code),
    name: values.name,
    unit: values.unit,
    unitPrice: values.unitPrice,
    description: orNull(values.description),
    status: values.status,
  };
}

export function ProductForm({ product, isSubmitting, onSubmit, onCancel }: ProductFormProps) {
  const { register, handleSubmit, formState } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: product?.code ?? '',
      name: product?.name ?? '',
      unit: product?.unit ?? 'pcs',
      unitPrice: product ? String(product.unitPrice) : '',
      description: product?.description ?? '',
      status: product?.status ?? 'active',
    },
  });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} className="flex flex-col gap-[18px]" noValidate>
      <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
        <FormField label="Product name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
          <Input id="name" placeholder="e.g. Tomatoes (Grade A)" {...register('name')} />
        </FormField>
        <FormField label="Code" htmlFor="code" error={errors.code?.message}>
          <Input id="code" placeholder="e.g. VEG-001" {...register('code')} />
        </FormField>
        <FormField label="Unit" htmlFor="unit" required error={errors.unit?.message}>
          <Input id="unit" list="product-units" autoComplete="off" {...register('unit')} />
          <datalist id="product-units">
            {UNIT_SUGGESTIONS.map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Unit price (before VAT)" htmlFor="unitPrice" required error={errors.unitPrice?.message}>
          <MoneyInput id="unitPrice" {...register('unitPrice')} />
        </FormField>
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <SegmentedRadio id="status" label="Status" registration={register('status')} options={STATUS_OPTIONS} />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
          <Textarea id="description" className="min-h-16" placeholder="Internal notes" {...register('description')} />
        </FormField>
      </div>
      {product ? (
        <p className="text-xs text-muted-foreground">
          A new price applies to new invoice lines only; invoices already raised keep the price they were sold at.
        </p>
      ) : null}

      <div className="flex justify-end gap-2.5 border-t border-border pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button loading={isSubmitting} type="submit" size="lg">
          {product ? 'Save changes' : 'Save product'}
        </Button>
      </div>
    </form>
  );
}
