import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { apiClient } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { PaginationMeta } from '@/types/common.types';

export interface PaginatedApiResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export class BaseService {
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  protected async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedApiResult<T>> {
    const response = await apiClient.get<ApiResponse<T[]> & { meta?: PaginationMeta }>(
      url,
      config,
    );
    const { data, meta } = response.data;
    return {
      items: data,
      meta: meta ?? { page: 1, limit: 10, total: data.length, totalPages: 1 },
    };
  }

  protected async post<T, P = unknown>(
    url: string,
    payload?: P,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, payload, config);
    return response.data.data;
  }

  protected async put<T, P = unknown>(
    url: string,
    payload?: P,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, payload, config);
    return response.data.data;
  }

  protected async patch<T, P = unknown>(
    url: string,
    payload?: P,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, payload, config);
    return response.data.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  protected async getRawResponse<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return apiClient.get<T>(url, config);
  }
}
