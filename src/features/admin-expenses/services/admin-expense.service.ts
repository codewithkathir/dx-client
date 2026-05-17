import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  AdminExpenseListFilters,
  AdminExpenseSummary,
  AdminExpenseSummaryFilters,
  Expense,
  ExpenseListResult,
  UpdateAdminExpenseStatusPayload,
} from '@/types/expense.types';

function buildListParams(
  filters: AdminExpenseListFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.status) params.status = filters.status;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return params;
}

function buildSummaryParams(
  filters: AdminExpenseSummaryFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.status) params.status = filters.status;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return params;
}

class AdminExpenseService extends BaseService {
  list(filters: AdminExpenseListFilters): Promise<ExpenseListResult> {
    return this.getPaginated<Expense>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getSummary(filters: AdminExpenseSummaryFilters): Promise<AdminExpenseSummary> {
    return this.get<AdminExpenseSummary>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.SUMMARY, {
      params: buildSummaryParams(filters),
    });
  }

  getById(id: number): Promise<Expense> {
    return this.get<Expense>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.DETAIL(id));
  }

  updateStatus(
    id: number,
    payload: UpdateAdminExpenseStatusPayload,
  ): Promise<Expense> {
    return this.put<Expense>(
      API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.STATUS(id),
      payload,
    );
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.DETAIL(id));
  }
}

export const adminExpenseService = new AdminExpenseService();
