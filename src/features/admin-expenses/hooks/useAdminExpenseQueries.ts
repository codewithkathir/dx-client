'use client';

import { useQuery } from '@tanstack/react-query';

import { adminDropdownService } from '@/features/admin-expenses/services/admin-dropdown.service';
import { adminExpenseService } from '@/features/admin-expenses/services/admin-expense.service';
import { employeeService } from '@/features/employees/services/employee.service';
import { ADMIN_EMPLOYEE_LIST_LIMIT } from '@/features/admin-expenses/constants/admin-expense.constants';
import { queryKeys } from '@/lib/query-keys';
import type {
  AdminExpenseListFilters,
  AdminExpenseSummaryFilters,
} from '@/types/expense.types';

export function useAdminExpenses(filters: AdminExpenseListFilters) {
  return useQuery({
    queryKey: queryKeys.adminExpenses.list(filters),
    queryFn: () => adminExpenseService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAdminExpenseSummary(filters: AdminExpenseSummaryFilters) {
  return useQuery({
    queryKey: queryKeys.adminExpenses.summary(filters),
    queryFn: () => adminExpenseService.getSummary(filters),
  });
}

export function useAdminExpense(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.adminExpenses.detail(id ?? 0),
    queryFn: () => adminExpenseService.getById(id!),
    enabled: id != null && id > 0,
  });
}

export function useAdminCategoryDropdown() {
  return useQuery({
    queryKey: queryKeys.adminDropdowns.categories,
    queryFn: () => adminDropdownService.listCategories(),
    staleTime: 60_000,
  });
}

export function useAdminPaymentMethodDropdown() {
  return useQuery({
    queryKey: queryKeys.adminDropdowns.paymentMethods,
    queryFn: () => adminDropdownService.listPaymentMethods(),
    staleTime: 60_000,
  });
}

export function useAdminWhomDropdown() {
  return useQuery({
    queryKey: queryKeys.adminDropdowns.whom,
    queryFn: () => adminDropdownService.listWhom(),
    staleTime: 60_000,
  });
}

export function useAdminEmployeeOptions() {
  return useQuery({
    queryKey: queryKeys.employees.list({ page: 1, limit: ADMIN_EMPLOYEE_LIST_LIMIT }),
    queryFn: () =>
      employeeService.list({ page: 1, limit: ADMIN_EMPLOYEE_LIST_LIMIT, order: 'asc' }),
    staleTime: 60_000,
  });
}
