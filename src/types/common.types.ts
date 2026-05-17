export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = string | number;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
