import type { ExpenseReimbursement } from '@/types/finance.types';
import type { PaginationMeta } from '@/types/common.types';

export type EmployeeExpenseStatus = 'pending' | 'approved' | 'rejected';

export type AdminExpenseStatus = 'pending' | 'paid' | 'rejected';

export interface Expense {
  id: number;
  employeeId: number;
  date: string;
  amount: number;
  whom: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number | null;
  description: string | null;
  paymentMethodId: number;
  supportFile: string | null;
  /** Vehicle the claim was for (vehicle categories) and its km. */
  assetId: number | null;
  odometerKm: number | null;
  vehicle?: { assetNo: string; name: string } | null;
  /** Part of an approved claim taken from the employee's advance. */
  advanceAmount: number;
  /** Part reimbursed via Payables; null until approved. */
  reimbursableAmount: number | null;
  employeeStatus: EmployeeExpenseStatus;
  adminStatus: AdminExpenseStatus;
  /** Admin's note to the employee on approval or rejection. */
  reviewNote?: string | null;
  reviewedAt?: string | null;
  /** Reimbursement bill created when the expense was approved. */
  reimbursement?: ExpenseReimbursement | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  stage?: ExpenseStage;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface StageTotals {
  count: number;
  amount: number;
}

/** Employee home: claims per stage, what is still owed back, and what was paid this year. */
export interface EmployeeExpenseSummary {
  stages: Record<ExpenseStage, StageTotals>;
  toBeReimbursed: StageTotals;
  paidThisYear: number;
}

export interface AdminExpenseListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  employeeId?: number;
  assetId?: number;
  status?: AdminExpenseStatus;
  /** Combined stage: pending (awaiting approval), approved (awaiting payment), paid, rejected. */
  stage?: ExpenseStage;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type ExpenseStage = 'pending' | 'approved' | 'paid' | 'rejected';

export interface AdminExpenseSummary {
  totalCount: number;
  totalAmount: number;
  byStatus: Array<{
    adminStatus: AdminExpenseStatus;
    count: number;
    amount: number;
  }>;
}

export interface AdminExpenseSummaryFilters {
  employeeId?: number;
  status?: AdminExpenseStatus;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateAdminExpenseStatusPayload {
  adminStatus: AdminExpenseStatus;
}

export interface ExpenseListResult {
  items: Expense[];
  meta: PaginationMeta;
}

export interface CreateExpensePayload {
  date: string;
  amount: number;
  /** Ignored by the server: a claim is always for the logged-in employee. */
  whom?: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId?: number | null;
  description?: string | null;
  paymentMethodId: number;
  assetId?: number | null;
  odometerKm?: number | null;
}

export interface UpdateExpensePayload {
  date?: string;
  amount?: number;
  whom?: number;
  categoryId?: number;
  subCategoryId?: number;
  subSubCategoryId?: number | null;
  description?: string | null;
  paymentMethodId?: number;
  assetId?: number | null;
  odometerKm?: number | null;
}

/** Admin correction of the vehicle and km on a claim. */
export interface UpdateExpenseVehiclePayload {
  assetId: number | null;
  odometerKm: number | null;
}

export interface DropdownOption {
  id: number;
  name: string;
}

export interface CategoryDropdownOption extends DropdownOption {
  /** Claims in this category ask for a vehicle and its odometer. */
  isVehicleExpense: boolean;
}

export interface VehicleDropdownOption {
  id: number;
  assetNo: string;
  name: string;
  odometerKm: number | null;
}

export interface WhomDropdownOption {
  id: number;
  empName: string;
  employeeCode: string | null;
  status: string;
}
