import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  Bill,
  BillDetail,
  BillListFilters,
  BillPayload,
  ListResult,
  PayablesSummary,
  PaymentPayload,
} from '@/types/finance.types';

function buildListParams(filters: BillListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.payeeType) params.payeeType = filters.payeeType;
  if (filters.supplierId) params.supplierId = filters.supplierId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  return params;
}

class PayableService extends BaseService {
  list(filters: BillListFilters): Promise<ListResult<Bill>> {
    return this.getPaginated<Bill>(API_ENDPOINTS.PAYABLES.LIST, { params: buildListParams(filters) });
  }

  summary(): Promise<PayablesSummary> {
    return this.get<PayablesSummary>(API_ENDPOINTS.PAYABLES.SUMMARY);
  }

  detail(id: number): Promise<BillDetail> {
    return this.get<BillDetail>(API_ENDPOINTS.PAYABLES.DETAIL(id));
  }

  create(payload: BillPayload): Promise<BillDetail> {
    return this.post<BillDetail>(API_ENDPOINTS.PAYABLES.LIST, payload);
  }

  update(id: number, payload: Partial<BillPayload>): Promise<BillDetail> {
    return this.put<BillDetail>(API_ENDPOINTS.PAYABLES.DETAIL(id), payload);
  }

  issue(id: number): Promise<BillDetail> {
    return this.post<BillDetail>(API_ENDPOINTS.PAYABLES.ISSUE(id));
  }

  cancel(id: number): Promise<BillDetail> {
    return this.post<BillDetail>(API_ENDPOINTS.PAYABLES.CANCEL(id));
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.PAYABLES.DETAIL(id));
  }

  recordPayment(id: number, payload: PaymentPayload): Promise<BillDetail> {
    return this.post<BillDetail>(API_ENDPOINTS.PAYABLES.PAYMENTS(id), payload);
  }

  deletePayment(id: number, paymentId: number): Promise<BillDetail> {
    return super.delete<BillDetail>(API_ENDPOINTS.PAYABLES.PAYMENT(id, paymentId));
  }
}

export const payableService = new PayableService();
