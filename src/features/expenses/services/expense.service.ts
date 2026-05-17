import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  CreateExpensePayload,
  Expense,
  ExpenseListFilters,
  ExpenseListResult,
  UpdateExpensePayload,
} from '@/types/expense.types';

function buildListParams(filters: ExpenseListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return params;
}

function appendPayloadToFormData(
  formData: FormData,
  payload: CreateExpensePayload | UpdateExpensePayload,
): void {
  const entries: Record<string, string | number | null | undefined> = {
    ...payload,
  };

  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined) continue;
    if (value === null) {
      formData.append(key, '');
      continue;
    }
    formData.append(key, String(value));
  }
}

class ExpenseService extends BaseService {
  list(filters: ExpenseListFilters): Promise<ExpenseListResult> {
    return this.getPaginated<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getById(id: number): Promise<Expense> {
    return this.get<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.DETAIL(id));
  }

  create(payload: CreateExpensePayload, supportFile?: File | null): Promise<Expense> {
    if (supportFile) {
      const formData = new FormData();
      appendPayloadToFormData(formData, payload);
      formData.append('supportFile', supportFile);
      return this.post<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.LIST, formData);
    }
    return this.post<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.LIST, payload);
  }

  update(
    id: number,
    payload: UpdateExpensePayload,
    supportFile?: File | null,
  ): Promise<Expense> {
    if (supportFile) {
      const formData = new FormData();
      appendPayloadToFormData(formData, payload);
      formData.append('supportFile', supportFile);
      return this.put<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.DETAIL(id), formData);
    }
    return this.put<Expense>(API_ENDPOINTS.EMPLOYEE_EXPENSES.DETAIL(id), payload);
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.EMPLOYEE_EXPENSES.DETAIL(id));
  }
}

export const expenseService = new ExpenseService();
