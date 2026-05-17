import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { store } from '@/store';
import { decrementApiLoading, incrementApiLoading } from '@/store/loading/loading.slice';

function shouldTrackLoading(config: InternalAxiosRequestConfig): boolean {
  if (config.skipGlobalLoader) return false;
  if (config._retry) return false;
  return true;
}

function trackRequest(config: InternalAxiosRequestConfig): void {
  if (!shouldTrackLoading(config) || config._loadingTracked) return;
  config._loadingTracked = true;
  store.dispatch(incrementApiLoading());
}

function untrackRequest(config?: InternalAxiosRequestConfig): void {
  if (!config?._loadingTracked) return;
  config._loadingTracked = false;
  store.dispatch(decrementApiLoading());
}

export function setupLoadingInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    trackRequest(config);
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      untrackRequest(response.config);
      return response;
    },
    (error: AxiosError) => {
      untrackRequest(error.config);
      return Promise.reject(error);
    },
  );
}
