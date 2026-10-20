import type { AccountEntryType } from '@/types/employee-account.types';

export const ENTRY_TYPE_LABELS: Record<AccountEntryType, string> = {
  advance: 'Advance',
  expense: 'Claim paid',
  return: 'Returned',
  adjustment: 'Adjustment',
};
