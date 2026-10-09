import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  ListResult,
  PartyListFilters,
  Customer,
  CustomerOption,
  CustomerPayload,
} from '@/types/finance.types';

function buildListParams(filters: PartyListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  return params;
}

class CustomerService extends BaseService {
  list(filters: PartyListFilters): Promise<ListResult<Customer>> {
    return this.getPaginated<Customer>(API_ENDPOINTS.CUSTOMERS.LIST, {
      params: buildListParams(filters),
    });
  }

  options(): Promise<CustomerOption[]> {
    return this.get<CustomerOption[]>(API_ENDPOINTS.CUSTOMERS.OPTIONS);
  }

  create(payload: CustomerPayload): Promise<Customer> {
    return this.post<Customer>(API_ENDPOINTS.CUSTOMERS.LIST, payload);
  }

  update(id: number, payload: CustomerPayload): Promise<Customer> {
    return this.put<Customer>(API_ENDPOINTS.CUSTOMERS.DETAIL(id), payload);
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
  }
}

export const customerService = new CustomerService();
