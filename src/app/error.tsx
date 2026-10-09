'use client';

import Link from 'next/link';
import { RefreshCw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { USER_ROUTES } from '@/constants/routes.constants';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Design "ErrorPage". */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8 text-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG lockup */}
      <img src="/brand/dx-lockup.svg" alt="DX Enterprise" className="h-9 w-auto self-start" />
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-[18px] bg-status-danger text-destructive" aria-hidden>
            <TriangleAlert className="size-[30px]" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.025em]">Something went wrong</h1>
            <p className="mt-2 text-[15px] leading-[22px] text-muted-foreground">
              Something went wrong. Please try again later. Your data is safe — nothing was saved halfway.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="lg" render={<Link href={USER_ROUTES.HOME} />}>
              Go home
            </Button>
            <Button size="lg" onClick={reset}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
          {error.digest ? <p className="font-mono text-xs text-muted-foreground">Error reference: {error.digest}</p> : null}
        </div>
      </div>
    </div>
  );
}
