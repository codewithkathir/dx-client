import { cn } from '@/lib/utils';

/** Placeholder block with a soft shimmer sweep while content loads. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" aria-hidden className={cn('shimmer rounded-md', className)} {...props} />;
}

export { Skeleton };
