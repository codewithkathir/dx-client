import type { PaginationMeta } from '@/types/common.types';

/** + advance, − expense (claim settled from it), − return, ± adjustment. */
export type AccountEntryType = 'advance' | 'expense' | 'return' | 'adjustment';

export interface EmployeeAccount {
  employeeId: number;
  employeeName: string;
  employeeCode: string | null;
  employeeStatus: string;
  /** Company money the employee is holding. */
  balance: number;
  totalAdvanced: number;
  lastActivity: string | null;
  /** Claims waiting for approval; they draw on the balance first. */
  pendingClaims: { count: number; amount: number };
  /** Open reimbursement bills: what the company still owes the employee. */
  owedToEmployee: number;
}

export interface AccountEntry {
  id: number;
  employeeId: number;
  entryDate: string;
  type: AccountEntryType;
  amount: number;
  runningBalance: number;
  expenseId: number | null;
  expenseLabel: string | null;
  expenseAmount: number | null;
  paymentMethodId: number | null;
  paymentMethodName: string | null;
  reference: string | null;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
  voidedAt: string | null;
  voidedByName: string | null;
  voidReason: string | null;
}

export interface EmployeeAccountsSummary {
  totalOutstanding: number;
  employeesHolding: number;
  advancedThisMonth: number;
  returnedThisMonth: number;
  owedToEmployees: number;
}

export type AccountListShow = 'all' | 'holding' | 'owed' | 'active';

export interface AccountListFilters {
  page?: number;
  limit?: number;
  search?: string;
  show?: AccountListShow;
  sortBy?: 'balance' | 'name' | 'last_activity' | 'owed';
  order?: 'asc' | 'desc';
}

export interface AccountEntryFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  includeVoided?: boolean;
}

export interface AccountListResult {
  items: EmployeeAccount[];
  meta: PaginationMeta;
}

export interface AccountEntryListResult {
  items: AccountEntry[];
  meta: PaginationMeta;
}

export interface CashEntryPayload {
  amount: number;
  entryDate: string;
  paymentMethodId: number;
  reference?: string | null;
  notes?: string | null;
}

export interface AdjustmentPayload {
  /** Signed: positive adds to the balance. */
  amount: number;
  entryDate: string;
  notes: string;
}

/** How approving a claim would split between the advance and a reimbursement bill. */
export interface ApprovalPreview {
  expenseId: number;
  amount: number;
  balanceBefore: number;
  fromAdvance: number;
  reimbursable: number;
  balanceAfter: number;
}
