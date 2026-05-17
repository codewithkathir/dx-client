'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { adminDropdownService } from '@/features/admin-expenses/services/admin-dropdown.service';
import { queryKeys } from '@/lib/query-keys';

export function useAdminSubCategoryLabelMap(categoryIds: number[]) {
  const queries = useQueries({
    queries: categoryIds.map((categoryId) => ({
      queryKey: queryKeys.adminDropdowns.subCategories(categoryId),
      queryFn: () => adminDropdownService.listSubCategories(categoryId),
      staleTime: 60_000,
    })),
  });

  return useMemo(() => {
    const map: Record<number, string> = {};
    for (const query of queries) {
      query.data?.forEach((item) => {
        map[item.id] = item.name;
      });
    }
    return map;
  }, [queries]);
}
