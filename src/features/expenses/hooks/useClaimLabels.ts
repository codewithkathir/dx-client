'use client';

import { useCallback, useMemo } from 'react';

import { useCategoryDropdown } from '@/features/expenses/hooks/useExpenseQueries';
import { useSubCategoryLabelMap } from '@/features/expenses/hooks/useSubCategoryLabelMap';
import { claimTitle } from '@/features/expenses/utils/claim.utils';
import type { Expense } from '@/types/expense.types';

/** Category names for a set of claims: "Meals › Client entertainment" and a display title. */
export function useClaimLabels(expenses: Pick<Expense, 'categoryId'>[]) {
  const { data: categories = [] } = useCategoryDropdown();
  const categoryIds = useMemo(
    () => [...new Set(expenses.map((e) => e.categoryId))].sort((a, b) => a - b),
    [expenses],
  );
  const subCategoryNames = useSubCategoryLabelMap(categoryIds);
  const categoryNames = useMemo(() => new Map(categoryEntries(categories)), [categories]);

  const categoryPath = useCallback(
    (e: Pick<Expense, 'categoryId' | 'subCategoryId'>) =>
      [categoryNames.get(e.categoryId), subCategoryNames[e.subCategoryId]].filter(Boolean).join(' › ') || 'Expense',
    [categoryNames, subCategoryNames],
  );

  const title = useCallback(
    (e: Pick<Expense, 'description' | 'categoryId' | 'subCategoryId'>) =>
      claimTitle(e.description, subCategoryNames[e.subCategoryId] ?? categoryNames.get(e.categoryId) ?? 'Expense claim'),
    [categoryNames, subCategoryNames],
  );

  return { categoryPath, title, categories };
}

function categoryEntries(list: Array<{ id: number; name: string }>): Array<[number, string]> {
  return list.map((c) => [c.id, c.name]);
}
