import axios, { type AxiosInstance } from 'axios';

import { appConfig } from '@/config/app.config';
import { envConfig } from '@/config/env.config';
import { setupLoadingInterceptors } from '@/services/loading.interceptor';
import { setupInterceptors } from '@/services/interceptors';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: envConfig.apiUrl,
    timeout: appConfig.apiTimeoutMs,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true,
  });

  setupInterceptors(client);
  setupLoadingInterceptors(client);
  return client;
}

export const apiClient = createApiClient();
