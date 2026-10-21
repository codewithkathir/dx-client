import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type { ListResult } from '@/types/finance.types';
import type { Product, ProductListFilters, ProductOption, ProductPayload } from '@/types/product.types';

function buildListParams(filters: ProductListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    sortBy: 'name',
    order: filters.order ?? 'asc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  return params;
}

/** Products are never deleted, so there is no remove(): set the status to inactive instead. */
class ProductService extends BaseService {
  list(filters: ProductListFilters): Promise<ListResult<Product>> {
    return this.getPaginated<Product>(API_ENDPOINTS.PRODUCTS.LIST, { params: buildListParams(filters) });
  }

  /** Active products with their prices, for invoice lines. */
  options(): Promise<ProductOption[]> {
    return this.get<ProductOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.PRODUCTS);
  }

  create(payload: ProductPayload): Promise<Product> {
    return this.post<Product>(API_ENDPOINTS.PRODUCTS.LIST, payload);
  }

  update(id: number, payload: ProductPayload): Promise<Product> {
    return this.put<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id), payload);
  }
}

export const productService = new ProductService();
