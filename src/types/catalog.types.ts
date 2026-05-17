import type { PaginationMeta } from '@/types/common.types';

export type CatalogStatus = 'active' | 'inactive';

export interface CatalogListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: CatalogStatus | '';
  categoryId?: number;
  subCategoryId?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubSubCategory {
  id: number;
  categoryId: number;
  subCategoryId: number;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  status?: CatalogStatus;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
}

export interface CreateSubCategoryPayload {
  categoryId: number;
  name: string;
  description?: string | null;
  status?: CatalogStatus;
}

export interface UpdateSubCategoryPayload {
  categoryId?: number;
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
}

export interface CreateSubSubCategoryPayload {
  categoryId: number;
  subCategoryId: number;
  name: string;
  description?: string | null;
  status?: CatalogStatus;
}

export interface UpdateSubSubCategoryPayload {
  categoryId?: number;
  subCategoryId?: number;
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
}
