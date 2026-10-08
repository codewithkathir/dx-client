import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/common.types';
import { getPageItems } from '@/utils/pagination.utils';

interface TablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({ meta, onPageChange, className }: TablePaginationProps) {
  const totalPages = Math.max(meta.totalPages, 1);
  const page = Math.min(Math.max(meta.page, 1), totalPages);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const goTo = (target: number) => {
    if (target !== page) onPageChange(target);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {meta.total} total
      </p>
      <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={isFirst}
          onClick={() => goTo(1)}
          aria-label="First page"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={isFirst}
          onClick={() => goTo(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>

        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <Button
              key={item}
              variant={item === page ? 'default' : 'ghost'}
              size="sm"
              className="min-w-7 px-2 tabular-nums"
              onClick={() => goTo(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </Button>
          ) : (
            <span
              key={item}
              className="flex h-7 min-w-7 items-center justify-center text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={isLast}
          onClick={() => goTo(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={isLast}
          onClick={() => goTo(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight />
        </Button>
      </nav>
    </div>
  );
}
