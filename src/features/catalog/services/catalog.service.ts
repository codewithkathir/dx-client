import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  CatalogListFilters,
  CatalogListResult,
  Category,
  CreateCategoryPayload,
  CreateSubCategoryPayload,
  CreateSubSubCategoryPayload,
  SubCategory,
  SubSubCategory,
  UpdateCategoryPayload,
  UpdateSubCategoryPayload,
  UpdateSubSubCategoryPayload,
} from '@/types/catalog.types';

function buildListParams(filters: CatalogListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.subCategoryId) params.subCategoryId = filters.subCategoryId;

  return params;
}

class CatalogService extends BaseService {
  listCategories(filters: CatalogListFilters): Promise<CatalogListResult<Category>> {
    return this.getPaginated<Category>(API_ENDPOINTS.CATEGORIES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getCategory(id: number): Promise<Category> {
    return this.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  }

  createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return this.post<Category>(API_ENDPOINTS.CATEGORIES.LIST, payload);
  }

  updateCategory(id: number, payload: UpdateCategoryPayload): Promise<Category> {
    return this.put<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id), payload);
  }

  deleteCategory(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  }

  listSubCategoriesByCategory(
    categoryId: number,
    filters: CatalogListFilters,
  ): Promise<CatalogListResult<SubCategory>> {
    return this.getPaginated<SubCategory>(API_ENDPOINTS.CATEGORIES.SUB_BY_CATEGORY(categoryId), {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  listSubCategories(filters: CatalogListFilters): Promise<CatalogListResult<SubCategory>> {
    return this.getPaginated<SubCategory>(API_ENDPOINTS.SUB_CATEGORIES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getSubCategory(id: number): Promise<SubCategory> {
    return this.get<SubCategory>(API_ENDPOINTS.SUB_CATEGORIES.DETAIL(id));
  }

  createSubCategory(payload: CreateSubCategoryPayload): Promise<SubCategory> {
    return this.post<SubCategory>(API_ENDPOINTS.SUB_CATEGORIES.LIST, payload);
  }

  updateSubCategory(id: number, payload: UpdateSubCategoryPayload): Promise<SubCategory> {
    return this.put<SubCategory>(API_ENDPOINTS.SUB_CATEGORIES.DETAIL(id), payload);
  }

  deleteSubCategory(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.SUB_CATEGORIES.DETAIL(id));
  }

  listSubSubCategories(
    filters: CatalogListFilters,
  ): Promise<CatalogListResult<SubSubCategory>> {
    return this.getPaginated<SubSubCategory>(API_ENDPOINTS.SUB_SUB_CATEGORIES.LIST, {
      params: buildListParams(filters),
    }).then(({ items, meta }) => ({ items, meta }));
  }

  getSubSubCategory(id: number): Promise<SubSubCategory> {
    return this.get<SubSubCategory>(API_ENDPOINTS.SUB_SUB_CATEGORIES.DETAIL(id));
  }

  createSubSubCategory(payload: CreateSubSubCategoryPayload): Promise<SubSubCategory> {
    return this.post<SubSubCategory>(API_ENDPOINTS.SUB_SUB_CATEGORIES.LIST, payload);
  }

  updateSubSubCategory(
    id: number,
    payload: UpdateSubSubCategoryPayload,
  ): Promise<SubSubCategory> {
    return this.put<SubSubCategory>(API_ENDPOINTS.SUB_SUB_CATEGORIES.DETAIL(id), payload);
  }

  deleteSubSubCategory(id: number): Promise<void> {
    return super.delete<void>(API_ENDPOINTS.SUB_SUB_CATEGORIES.DETAIL(id));
  }
}

export const catalogService = new CatalogService();
