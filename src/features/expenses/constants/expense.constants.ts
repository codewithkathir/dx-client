import type { EmployeeExpenseStatus } from '@/types/expense.types';

export const EXPENSE_STATUS_LABELS: Record<EmployeeExpenseStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const EXPENSE_STATUS_VARIANT: Record<
  EmployeeExpenseStatus,
  'warning' | 'success' | 'destructive'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export const EXPENSE_DEFAULT_PAGE_SIZE = 10;

export const ACCEPTED_SUPPORT_FILE_TYPES =
  '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx';
