'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthInterceptorProvider } from '@/providers/AuthInterceptorProvider';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <AuthInterceptorProvider>
            <LoadingProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </LoadingProvider>
          </AuthInterceptorProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
