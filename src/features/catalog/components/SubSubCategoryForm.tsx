'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATALOG_STATUS_OPTIONS } from '@/features/catalog/constants/catalog.constants';
import {
  subSubCategoryFormSchema,
  type SubSubCategoryFormValues,
} from '@/features/catalog/schemas/sub-sub-category.schema';
import { useCategoryOptions, useSubCategoryOptions } from '@/features/catalog/hooks/useCatalogQueries';
import type { SubSubCategory } from '@/types/catalog.types';

interface SubSubCategoryFormProps {
  item?: SubSubCategory;
  defaultCategoryId?: number;
  defaultSubCategoryId?: number;
  isSubmitting?: boolean;
  onSubmit: (values: SubSubCategoryFormValues) => void;
  onCancel: () => void;
}

export function SubSubCategoryForm({
  item,
  defaultCategoryId,
  defaultSubCategoryId,
  isSubmitting,
  onSubmit,
  onCancel,
}: SubSubCategoryFormProps) {
  const { data: categoriesData } = useCategoryOptions();
  const categories = categoriesData?.items ?? [];

  const { register, handleSubmit, formState, watch, setValue } = useForm<SubSubCategoryFormValues>({
    resolver: zodResolver(subSubCategoryFormSchema),
    defaultValues: {
      categoryId: item?.categoryId ?? defaultCategoryId ?? 0,
      subCategoryId: item?.subCategoryId ?? defaultSubCategoryId ?? 0,
      name: item?.name ?? '',
      description: item?.description ?? '',
      status: item?.status ?? 'active',
    },
  });

  const categoryId = watch('categoryId');
  const { data: subCategoriesData } = useSubCategoryOptions(
    categoryId > 0 ? categoryId : undefined,
  );
  const subCategories = subCategoriesData?.items ?? [];

  useEffect(() => {
    if (item) return;
    setValue('subCategoryId', 0);
  }, [categoryId, item, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Main category"
        htmlFor="sscCategory"
        required
        error={formState.errors.categoryId?.message}
      >
        <Select id="sscCategory" {...register('categoryId', { valueAsNumber: true })}>
          <option value={0}>Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Sub category"
        htmlFor="sscSubCategory"
        required
        error={formState.errors.subCategoryId?.message}
      >
        <Select
          id="sscSubCategory"
          {...register('subCategoryId', { valueAsNumber: true })}
          disabled={!categoryId || categoryId <= 0}
        >
          <option value={0}>Select sub category</option>
          {subCategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Name" htmlFor="sscName" required error={formState.errors.name?.message}>
        <Input id="sscName" {...register('name')} />
      </FormField>

      <FormField label="Description" htmlFor="sscDesc" error={formState.errors.description?.message}>
        <Textarea id="sscDesc" rows={3} {...register('description')} />
      </FormField>

      <FormField label="Status" htmlFor="sscStatus" required error={formState.errors.status?.message}>
        <Select id="sscStatus" {...register('status')}>
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
          {isSubmitting ? 'Saving…' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
