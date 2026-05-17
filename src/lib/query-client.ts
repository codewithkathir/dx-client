import { QueryClient } from '@tanstack/react-query';

import { appConfig } from '@/config/app.config';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appConfig.staleTimeMs,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
