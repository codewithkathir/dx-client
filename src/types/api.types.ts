import type { PaginationMeta } from '@/types/common.types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiFieldError[];
  pagination?: PaginationMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface NormalizedApiError {
  statusCode: number;
  message: string;
  errors: ApiFieldError[];
  timestamp?: string;
}
