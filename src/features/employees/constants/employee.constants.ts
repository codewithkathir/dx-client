import type { EmployeeStatus } from '@/types/employee.types';

export const EMPLOYEE_MODAL_IDS = {
  CREATE: 'employee-create',
  EDIT: 'employee-edit',
  DELETE: 'employee-delete',
  VIEW: 'employee-view',
} as const;

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

export const EMPLOYEE_STATUS_OPTIONS: Array<{ value: EmployeeStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];
