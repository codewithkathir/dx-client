'use client';

import { useMemo } from 'react';

import {
  useAdminCategoryDropdown,
  useAdminEmployeeOptions,
  useAdminPaymentMethodDropdown,
  useAdminWhomDropdown,
} from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { useAdminSubCategoryLabelMap } from '@/features/admin-expenses/hooks/useAdminSubCategoryLabelMap';

/** Id → name maps used to display expense claims (shared by the list and review pages). */
export function useExpenseLookups() {
  const { data: categories = [] } = useAdminCategoryDropdown();
  const { data: whomOptions = [] } = useAdminWhomDropdown();
  const { data: paymentMethods = [] } = useAdminPaymentMethodDropdown();
  const { data: employeeData } = useAdminEmployeeOptions();
  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const subCategoryMap = useAdminSubCategoryLabelMap(categoryIds);

  return useMemo(() => {
    const employees = employeeData?.items ?? [];
    return {
      categories,
      employees,
      categoryMap: Object.fromEntries(categories.map((c) => [c.id, c.name])) as Record<number, string>,
      subCategoryMap: subCategoryMap as Record<number, string>,
      whomMap: Object.fromEntries(whomOptions.map((w) => [w.id, w.empName])) as Record<number, string>,
      paymentMap: Object.fromEntries(paymentMethods.map((p) => [p.id, p.name])) as Record<number, string>,
      employeeMap: Object.fromEntries(employees.map((e) => [e.id, e.empName])) as Record<number, string>,
    };
  }, [categories, employeeData, whomOptions, paymentMethods, subCategoryMap]);
}
