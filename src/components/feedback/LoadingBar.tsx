'use client';

import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

import { cn } from '@/lib/utils';

/** Delay before showing, so quick responses don't flash the bar. */
const SHOW_AFTER_MS = 150;

/** Thin indeterminate bar along the top edge while data is loading or saving. */
export function LoadingBar({ className }: { className?: string }) {
  const busy = useIsFetching() + useIsMutating() > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!busy) {
      const hide = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(hide);
    }
    const show = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(show);
  }, [busy]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      <div className="progress-indeterminate h-full w-full rounded-full bg-primary" />
    </div>
  );
}
