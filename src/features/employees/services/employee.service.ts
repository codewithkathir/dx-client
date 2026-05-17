import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  BulkActionResult,
  BulkCreateResult,
  BulkDeletePayload,
  BulkStatusPayload,
  CreateEmployeePayload,
  Employee,
  EmployeeListFilters,
  EmployeeListResult,
  UpdateEmployeePayload,
} from '@/types/employee.types';

function buildListParams(filters: EmployeeListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.country) params.country = filters.country;
  if (filters.cityState) params.cityState = filters.cityState;
  if (filters.companyName) params.companyName = filters.companyName;
  if (filters.createdAtFrom) params.createdAtFrom = filters.createdAtFrom;
  if (filters.createdAtTo) params.createdAtTo = filters.createdAtTo;
  if (filters.visaExpiry) params.visaExpiry = filters.visaExpiry;
  if (filters.passportExpiry) params.passportExpiry = filters.passportExpiry;
  if (filters.sortBy) params.sortBy = filters.sortBy;

  return params;
}

function appendPayloadToFormData(
  formData: FormData,
  payload: CreateEmployeePayload | UpdateEmployeePayload,
): void {
  const entries: Record<string, string | number | null | undefined> = { ...payload };

  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined) continue;
    if (value === null) {
      formData.append(key, '');
      continue;
    }
    formData.append(key, String(value));
  }
}

class EmployeeService extends BaseService {
  list(filters: EmployeeListFilters): Promise<EmployeeListResult> {
    return this.getPaginated<Employee>(API_ENDPOINTS.EMPLOYEES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getById(id: number): Promise<Employee> {
    return this.get<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id));
  }

  create(payload: CreateEmployeePayload, profilePhoto?: File | null): Promise<Employee> {
    if (profilePhoto) {
      const formData = new FormData();
      appendPayloadToFormData(formData, payload);
      formData.append('profilePhoto', profilePhoto);
      return this.post<Employee>(API_ENDPOINTS.EMPLOYEES.LIST, formData);
    }
    return this.post<Employee>(API_ENDPOINTS.EMPLOYEES.LIST, payload);
  }

  update(
    id: number,
    payload: UpdateEmployeePayload,
    profilePhoto?: File | null,
  ): Promise<Employee> {
    if (profilePhoto) {
      const formData = new FormData();
      appendPayloadToFormData(formData, payload);
      formData.append('profilePhoto', profilePhoto);
      return this.put<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id), formData);
    }
    return this.put<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id), payload);
  }

  remove(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.EMPLOYEES.DETAIL(id));
  }

  bulkDelete(payload: BulkDeletePayload): Promise<BulkActionResult> {
    return this.post<BulkActionResult>(API_ENDPOINTS.EMPLOYEES.BULK_DELETE, payload);
  }

  bulkUpdateStatus(payload: BulkStatusPayload): Promise<BulkActionResult> {
    return this.post<BulkActionResult>(API_ENDPOINTS.EMPLOYEES.BULK_STATUS, payload);
  }

  bulkCreate(employees: CreateEmployeePayload[]): Promise<BulkCreateResult> {
    return this.post<BulkCreateResult>(API_ENDPOINTS.EMPLOYEES.BULK_CREATE, { employees });
  }

  async exportCsv(filters: EmployeeListFilters): Promise<Blob> {
    const response = await this.getRawResponse<Blob>(API_ENDPOINTS.EMPLOYEES.EXPORT, {
      params: { ...buildListParams({ ...filters, page: 1, limit: 5000 }), format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const employeeService = new EmployeeService();
