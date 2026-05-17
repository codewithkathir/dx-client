import type { RootState } from '@/store';

export const selectEmployeeFilters = (state: RootState) => state.employees.filters;
export const selectSelectedEmployeeIds = (state: RootState) => state.employees.selectedIds;
export const selectSelectedEmployeeCount = (state: RootState) =>
  state.employees.selectedIds.length;
