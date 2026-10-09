import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  Invoice,
  InvoiceDetail,
  InvoiceListFilters,
  InvoicePayload,
  ListResult,
  ReceiptPayload,
  ReceivablesSummary,
} from '@/types/finance.types';

function buildListParams(filters: InvoiceListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  return params;
}

class ReceivableService extends BaseService {
  list(filters: InvoiceListFilters): Promise<ListResult<Invoice>> {
    return this.getPaginated<Invoice>(API_ENDPOINTS.RECEIVABLES.LIST, { params: buildListParams(filters) });
  }

  summary(): Promise<ReceivablesSummary> {
    return this.get<ReceivablesSummary>(API_ENDPOINTS.RECEIVABLES.SUMMARY);
  }

  detail(id: number): Promise<InvoiceDetail> {
    return this.get<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.DETAIL(id));
  }

  create(payload: InvoicePayload): Promise<InvoiceDetail> {
    return this.post<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.LIST, payload);
  }

  update(id: number, payload: Partial<InvoicePayload>): Promise<InvoiceDetail> {
    return this.put<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.DETAIL(id), payload);
  }

  send(id: number): Promise<InvoiceDetail> {
    return this.post<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.SEND(id));
  }

  cancel(id: number): Promise<InvoiceDetail> {
    return this.post<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.CANCEL(id));
  }

  recordReceipt(id: number, payload: ReceiptPayload): Promise<InvoiceDetail> {
    return this.post<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.RECEIPTS(id), payload);
  }

  deleteReceipt(id: number, receiptId: number): Promise<InvoiceDetail> {
    return super.delete<InvoiceDetail>(API_ENDPOINTS.RECEIVABLES.RECEIPT(id, receiptId));
  }

  /** The PDF needs the auth header, so it's fetched as a blob rather than linked. */
  async downloadPdf(id: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.RECEIVABLES.PDF(id), { responseType: 'blob' });
    return response.data;
  }
}

export const receivableService = new ReceivableService();
