'use client';

import { useQuery } from '@tanstack/react-query';

import { dropdownService } from '@/features/expenses/services/dropdown.service';
import { expenseService } from '@/features/expenses/services/expense.service';
import { queryKeys } from '@/lib/query-keys';
import type { ExpenseListFilters } from '@/types/expense.types';

export function useExpenses(filters: ExpenseListFilters) {
  return useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: () => expenseService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useExpense(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id ?? 0),
    queryFn: () => expenseService.getById(id!),
    enabled: id != null && id > 0,
  });
}

export function useCategoryDropdown() {
  return useQuery({
    queryKey: queryKeys.dropdowns.categories,
    queryFn: () => dropdownService.listCategories(),
    staleTime: 60_000,
  });
}

export function useSubCategoryDropdown(categoryId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.dropdowns.subCategories(categoryId),
    queryFn: () => dropdownService.listSubCategories(categoryId!),
    enabled: categoryId != null && categoryId > 0,
    staleTime: 60_000,
  });
}

export function useSubSubCategoryDropdown(
  categoryId: number | undefined,
  subCategoryId: number | undefined,
) {
  return useQuery({
    queryKey: queryKeys.dropdowns.subSubCategories(categoryId, subCategoryId),
    queryFn: () => dropdownService.listSubSubCategories(categoryId!, subCategoryId!),
    enabled:
      categoryId != null &&
      categoryId > 0 &&
      subCategoryId != null &&
      subCategoryId > 0,
    staleTime: 60_000,
  });
}

export function usePaymentMethodDropdown() {
  return useQuery({
    queryKey: queryKeys.dropdowns.paymentMethods,
    queryFn: () => dropdownService.listPaymentMethods(),
    staleTime: 60_000,
  });
}

export function useWhomDropdown() {
  return useQuery({
    queryKey: queryKeys.dropdowns.whom,
    queryFn: () => dropdownService.listWhom(),
    staleTime: 60_000,
  });
}
