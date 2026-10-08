// Values are inlined at build time (see next.config.ts, which loads
// .env.<APP_ENV> and fails the build when a dev/qa value is missing).
// The localhost fallbacks only apply to APP_ENV=local.

export const APP_ENVS = ['local', 'dev', 'qa'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

const LOCAL_API_URL = 'http://localhost:5001/api';

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? 'local') as AppEnv;

export const envConfig = {
  appEnv,
  isLocal: appEnv === 'local',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'DX Enterprise',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
