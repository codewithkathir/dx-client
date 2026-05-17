import { envConfig } from '@/config/env.config';

export const appConfig = {
  name: envConfig.appName,
  defaultPageSize: 10,
  debounceMs: 300,
  apiTimeoutMs: 30000,
  staleTimeMs: 60_000,
} as const;
