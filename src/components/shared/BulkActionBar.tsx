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
        'mx-4 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#c9d6f7] bg-brand-blue-50 py-2.5 pr-3 pl-4',
        className,
      )}
    >
      <span className="text-sm font-semibold text-brand-blue-hover">
        {count} {label} selected
      </span>
      <span className="text-[13px] text-[#33415a] max-sm:hidden">Apply a bulk action or clear selection</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {children}
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          <X className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
