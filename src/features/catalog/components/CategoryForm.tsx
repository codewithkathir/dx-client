'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATALOG_STATUS_OPTIONS } from '@/features/catalog/constants/catalog.constants';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/features/catalog/schemas/category.schema';
import type { Category } from '@/types/catalog.types';

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
        <Select id="catStatus" {...register('status')}>
          {CATALOG_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : category ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
