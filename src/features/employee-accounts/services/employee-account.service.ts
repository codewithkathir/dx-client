import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  AccountEntryFilters,
  AccountEntryListResult,
  AccountListFilters,
  AccountListResult,
  AdjustmentPayload,
  CashEntryPayload,
  EmployeeAccount,
  EmployeeAccountsSummary,
} from '@/types/employee-account.types';

function buildAccountParams(filters: AccountListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = { page: filters.page ?? 1, limit: filters.limit ?? 10 };
  if (filters.search) params.search = filters.search;
  if (filters.show && filters.show !== 'all') params.show = filters.show;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.order) params.order = filters.order;
  return params;
}

function buildEntryParams(filters: AccountEntryFilters): Record<string, string | number> {
  const params: Record<string, string | number> = { page: filters.page ?? 1, limit: filters.limit ?? 20 };
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.includeVoided) params.includeVoided = 'true';
  return params;
}

/** Employee advance balances: give, return, adjust, and the statement. */
class EmployeeAccountService extends BaseService {
  listAccounts(filters: AccountListFilters): Promise<AccountListResult> {
    return this.getPaginated(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.LIST, { params: buildAccountParams(filters) });
  }

  getSummary(): Promise<EmployeeAccountsSummary> {
    return this.get<EmployeeAccountsSummary>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.SUMMARY);
  }

  getAccount(employeeId: number): Promise<EmployeeAccount> {
    return this.get<EmployeeAccount>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.DETAIL(employeeId));
  }

  listEntries(employeeId: number, filters: AccountEntryFilters): Promise<AccountEntryListResult> {
    return this.getPaginated(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.ENTRIES(employeeId), { params: buildEntryParams(filters) });
  }

  giveAdvance(employeeId: number, payload: CashEntryPayload): Promise<EmployeeAccount> {
    return this.post<EmployeeAccount>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.ADVANCES(employeeId), payload);
  }

  recordReturn(employeeId: number, payload: CashEntryPayload): Promise<EmployeeAccount> {
    return this.post<EmployeeAccount>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.RETURNS(employeeId), payload);
  }

  adjust(employeeId: number, payload: AdjustmentPayload): Promise<EmployeeAccount> {
    return this.post<EmployeeAccount>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.ADJUSTMENTS(employeeId), payload);
  }

  voidEntry(entryId: number, reason: string): Promise<EmployeeAccount> {
    return this.post<EmployeeAccount>(API_ENDPOINTS.EMPLOYEE_ACCOUNTS.VOID(entryId), { reason });
  }

  /** Employee app */
  getMyAccount(): Promise<EmployeeAccount> {
    return this.get<EmployeeAccount>(API_ENDPOINTS.MY_ACCOUNT.DETAIL);
  }

  listMyEntries(page: number): Promise<AccountEntryListResult> {
    return this.getPaginated(API_ENDPOINTS.MY_ACCOUNT.ENTRIES, { params: { page, limit: 20 } });
  }
}

export const employeeAccountService = new EmployeeAccountService();
