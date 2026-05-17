'use client';

import { useQuery } from '@tanstack/react-query';

import { employeeService } from '@/features/employees/services/employee.service';
import { queryKeys } from '@/lib/query-keys';
import { selectEmployeeFilters } from '@/store/employees/employees.selectors';
import { useAppSelector } from '@/store/hooks';

export function useEmployees() {
  const filters = useAppSelector(selectEmployeeFilters);

  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: () => employeeService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id ?? 0),
    queryFn: () => employeeService.getById(id!),
    enabled: id != null && id > 0,
  });
}
