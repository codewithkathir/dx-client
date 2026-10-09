'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { SegmentedRadio } from '@/components/forms/SegmentedRadio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/features/catalog/schemas/category.schema';
import type { Category } from '@/types/catalog.types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

interface CategoryFormProps {
  category?: Category;
  isSubmitting?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, isSubmitting, onSubmit, onCancel }: CategoryFormProps) {
  const { register, handleSubmit, formState } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      status: category?.status ?? 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="catName" required error={formState.errors.name?.message}>
        <Input id="catName" {...register('name')} />
      </FormField>

      <FormField label="Description" htmlFor="catDesc" error={formState.errors.description?.message}>
        <Textarea id="catDesc" rows={3} {...register('description')} />
      </FormField>

      <FormField label="Status" htmlFor="catStatus" required error={formState.errors.status?.message}>
        <SegmentedRadio
          id="catStatus"
          label="Status"
          registration={register('status')}
          options={STATUS_OPTIONS}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isSubmitting} type="submit" disabled={isSubmitting}>
          {'Save category'}
        </Button>
      </div>
    </form>
  );
}
