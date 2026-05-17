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
  employeeStatus: EmployeeExpenseStatus;
  adminStatus: AdminExpenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminExpenseListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  employeeId?: number;
  status?: AdminExpenseStatus;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

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
  whom: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId?: number | null;
  description?: string | null;
  paymentMethodId: number;
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
}

export interface DropdownOption {
  id: number;
  name: string;
}

export interface WhomDropdownOption {
  id: number;
  empName: string;
  employeeCode: string | null;
  status: string;
}
