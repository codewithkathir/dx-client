import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  ListResult,
  PartyPhotoChange,
  PartyListFilters,
  Supplier,
  SupplierOption,
  SupplierPayload,
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

class SupplierService extends BaseService {
  list(filters: PartyListFilters): Promise<ListResult<Supplier>> {
    return this.getPaginated<Supplier>(API_ENDPOINTS.SUPPLIERS.LIST, {
      params: buildListParams(filters),
    });
  }

  options(): Promise<SupplierOption[]> {
    return this.get<SupplierOption[]>(API_ENDPOINTS.SUPPLIERS.OPTIONS);
  }

  create(payload: SupplierPayload): Promise<Supplier> {
    return this.post<Supplier>(API_ENDPOINTS.SUPPLIERS.LIST, payload);
  }

  update(id: number, payload: SupplierPayload): Promise<Supplier> {
    return this.put<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id), payload);
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
  }

  uploadPhoto(id: number, file: File): Promise<Supplier> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.put<Supplier>(API_ENDPOINTS.SUPPLIERS.PHOTO(id), formData);
  }

  removePhoto(id: number): Promise<Supplier> {
    return super.delete<Supplier>(API_ENDPOINTS.SUPPLIERS.PHOTO(id));
  }

  /** Uploads or removes the picture after the supplier itself is saved. */
  async applyPhotoChange(id: number, change?: PartyPhotoChange): Promise<void> {
    if (change?.file) await this.uploadPhoto(id, change.file);
    else if (change?.remove) await this.removePhoto(id);
  }
}

export const supplierService = new SupplierService();
