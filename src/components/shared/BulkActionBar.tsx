'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  count: number;
  /** Singular noun, e.g. "employee" — pluralized automatically when count !== 1 */
  itemLabel?: string;
  onClear: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BulkActionBar({
  count,
  itemLabel = 'item',
  onClear,
  children,
  className,
}: BulkActionBarProps) {
  const label = count === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3',
        'sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold tabular-nums text-primary-foreground"
          aria-hidden
        >
          {count}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {count} {label} selected
          </p>
          <p className="text-xs text-muted-foreground">Apply a bulk action or clear selection</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {children}
        <span className="mx-1 hidden h-6 w-px bg-border sm:inline" aria-hidden />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
