import type { Expense } from '@/types/expense.types';

/** Pending claims can be approved. */
export const canApprove = (e: Expense) => e.employeeStatus === 'pending' && e.adminStatus === 'pending';

/** Anything not yet paid or rejected (and with nothing paid out) can be rejected. */
export const canReject = (e: Expense) =>
  e.employeeStatus !== 'rejected' &&
  e.adminStatus !== 'rejected' &&
  e.adminStatus !== 'paid' &&
  (e.reimbursement?.amountPaid ?? 0) === 0;
