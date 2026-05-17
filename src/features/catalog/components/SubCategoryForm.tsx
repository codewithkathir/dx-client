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
  subCategoryFormSchema,
  type SubCategoryFormValues,
} from '@/features/catalog/schemas/sub-category.schema';
import { useCategoryOptions } from '@/features/catalog/hooks/useCatalogQueries';
import type { SubCategory } from '@/types/catalog.types';

interface SubCategoryFormProps {
  subCategory?: SubCategory;
  defaultCategoryId?: number;
  isSubmitting?: boolean;
  onSubmit: (values: SubCategoryFormValues) => void;
  onCancel: () => void;
}

export function SubCategoryForm({
  subCategory,
  defaultCategoryId,
  isSubmitting,
  onSubmit,
  onCancel,
}: SubCategoryFormProps) {
  const { data: categoriesData } = useCategoryOptions();
  const categories = categoriesData?.items ?? [];

  const { register, handleSubmit, formState } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      categoryId: subCategory?.categoryId ?? defaultCategoryId ?? 0,
      name: subCategory?.name ?? '',
      description: subCategory?.description ?? '',
      status: subCategory?.status ?? 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Main category"
        htmlFor="subCatCategory"
        required
        error={formState.errors.categoryId?.message}
      >
        <Select id="subCatCategory" {...register('categoryId', { valueAsNumber: true })}>
          <option value={0}>Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Name" htmlFor="subCatName" required error={formState.errors.name?.message}>
        <Input id="subCatName" {...register('name')} />
      </FormField>

      <FormField label="Description" htmlFor="subCatDesc" error={formState.errors.description?.message}>
        <Textarea id="subCatDesc" rows={3} {...register('description')} />
      </FormField>

      <FormField label="Status" htmlFor="subCatStatus" required error={formState.errors.status?.message}>
        <Select id="subCatStatus" {...register('status')}>
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
          {isSubmitting ? 'Saving…' : subCategory ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
