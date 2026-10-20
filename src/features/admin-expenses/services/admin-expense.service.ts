import { API_ENDPOINTS } from '@/services/endpoints';
import type { ApprovalPreview } from '@/types/employee-account.types';
import { BaseService } from '@/services/base.service';
import type {
  AdminExpenseListFilters,
  AdminExpenseSummary,
  AdminExpenseSummaryFilters,
  Expense,
  ExpenseListResult,
  UpdateExpenseVehiclePayload,
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
  if (filters.stage) params.stage = filters.stage;
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

  /** Approving creates the employee's reimbursement bill in Payables. */
  /** The employee's advance is used first; only the rest becomes a reimbursement bill. */
  approve(id: number, note?: string | null): Promise<Expense> {
    return this.post<Expense>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.APPROVE(id), note ? { note } : {});
  }

  /** How approving now would split between the employee's advance and a bill. */
  approvalPreview(id: number): Promise<ApprovalPreview> {
    return this.get<ApprovalPreview>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.APPROVAL_PREVIEW(id));
  }

  /** Rejecting also cancels an unpaid reimbursement bill. */
  /** The note is shown to the employee and is required. */
  reject(id: number, note: string): Promise<Expense> {
    return this.post<Expense>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.REJECT(id), { note });
  }

  /** Set or fix the vehicle and km; on approved claims the linked service record is rebuilt. */
  updateVehicle(id: number, payload: UpdateExpenseVehiclePayload): Promise<Expense> {
    return this.put<Expense>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.VEHICLE(id), payload);
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.ADMIN_EMPLOYEE_EXPENSES.DETAIL(id));
  }
}

export const adminExpenseService = new AdminExpenseService();
