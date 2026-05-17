import type { AdminExpenseStatus } from '@/types/expense.types';

export const ADMIN_EXPENSE_STATUS_LABELS: Record<AdminExpenseStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  rejected: 'Rejected',
};

export const ADMIN_EXPENSE_STATUS_VARIANT: Record<
  AdminExpenseStatus,
  'warning' | 'success' | 'destructive'
> = {
  pending: 'warning',
  paid: 'success',
  rejected: 'destructive',
};

export const ADMIN_EXPENSE_STATUS_OPTIONS: Array<{
  value: AdminExpenseStatus | '';
  label: string;
}> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export const ADMIN_EXPENSE_DEFAULT_PAGE_SIZE = 10;

/** Backend max page size for employee list API */
export const ADMIN_EMPLOYEE_LIST_LIMIT = 100;
