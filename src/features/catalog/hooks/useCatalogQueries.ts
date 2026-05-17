'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogService } from '@/features/catalog/services/catalog.service';
import { queryKeys } from '@/lib/query-keys';
import type { CatalogListFilters } from '@/types/catalog.types';

export function useCategories(filters: CatalogListFilters) {
  return useQuery({
    queryKey: queryKeys.catalog.categories(filters),
    queryFn: () => catalogService.listCategories(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCategoryOptions() {
  return useQuery({
    queryKey: queryKeys.catalog.categoryOptions,
    queryFn: () =>
      catalogService.listCategories({ page: 1, limit: 100, status: 'active', order: 'asc' }),
    staleTime: 60_000,
  });
}

export function useSubCategories(filters: CatalogListFilters) {
  return useQuery({
    queryKey: queryKeys.catalog.subCategories(filters),
    queryFn: () => catalogService.listSubCategories(filters),
    placeholderData: (prev) => prev,
  });
}

export function useSubCategoryOptions(categoryId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.catalog.subCategoryOptions(categoryId),
    queryFn: () =>
      catalogService.listSubCategories({
        page: 1,
        limit: 100,
        status: 'active',
        order: 'asc',
        categoryId,
      }),
    enabled: categoryId != null && categoryId > 0,
    staleTime: 60_000,
  });
}

export function useSubSubCategories(filters: CatalogListFilters) {
  return useQuery({
    queryKey: queryKeys.catalog.subSubCategories(filters),
    queryFn: () => catalogService.listSubSubCategories(filters),
    placeholderData: (prev) => prev,
  });
}
