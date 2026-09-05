const requiredEnv = ['NEXT_PUBLIC_API_URL'] as const;

function getEnv(key: (typeof requiredEnv)[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const envConfig = {
  apiUrl: 'https://api.dxrecord.com/api', //  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'DX Enterprise',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export function validateEnv(): void {
  if (envConfig.isProduction) {
    requiredEnv.forEach((key) => getEnv(key));
  }
}
