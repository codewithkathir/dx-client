import { Skeleton } from '@/components/ui/skeleton';

/** Admin page placeholder: header, four stat cards and a table card. */
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <TableCardSkeleton />
    </div>
  );
}

/** A card with a filter row and table rows. */
export function TableCardSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex gap-3 p-4">
        <Skeleton className="h-9 flex-[2]" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
      <div className="h-11 border-y border-border bg-muted" />
      <TableRowsSkeleton rows={rows} />
    </div>
  );
}

/** Table body placeholder rows (cells of varied width read as data, not bars). */
export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Employee app placeholder: title, hero card and a list. */
export function MobilePageSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-6" role="status" aria-label="Loading page">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-44 rounded-[18px]" />
      <Skeleton className="h-[52px] rounded-[14px]" />
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
