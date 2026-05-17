'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { selectGlobalError } from '@/store/error/error.selectors';
import { clearGlobalError } from '@/store/error/error.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function GlobalErrorBanner() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectGlobalError);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm"
    >
      <p className="text-destructive">{error.message}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive"
        onClick={() => dispatch(clearGlobalError())}
        aria-label="Dismiss error"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
