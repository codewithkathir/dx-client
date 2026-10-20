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
  /** Claims in this category ask for a vehicle and its odometer. */
  isVehicleExpense: boolean;
  createdAt: string;
  updatedAt: string;
  /** Number of sub categories under it (list rows). */
  subCategoryCount?: number;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  status: CatalogStatus;
  /** Approved vehicle claims here create a service record of this type. */
  serviceTypeId: number | null;
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
  /** Approved vehicle claims here create a service record of this type. */
  serviceTypeId: number | null;
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
  isVehicleExpense?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
  isVehicleExpense?: boolean;
}

export interface CreateSubCategoryPayload {
  categoryId: number;
  name: string;
  description?: string | null;
  status?: CatalogStatus;
  serviceTypeId?: number | null;
}

export interface UpdateSubCategoryPayload {
  categoryId?: number;
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
  serviceTypeId?: number | null;
}

export interface CreateSubSubCategoryPayload {
  categoryId: number;
  subCategoryId: number;
  name: string;
  description?: string | null;
  status?: CatalogStatus;
  serviceTypeId?: number | null;
}

export interface UpdateSubSubCategoryPayload {
  categoryId?: number;
  subCategoryId?: number;
  name?: string;
  description?: string | null;
  status?: CatalogStatus;
  serviceTypeId?: number | null;
}
