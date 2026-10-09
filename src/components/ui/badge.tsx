import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-status-info text-status-info-ink',
        outline: 'border-border text-foreground',
        success: 'bg-status-success text-status-success-ink',
        warning: 'bg-status-warning text-status-warning-ink',
        destructive: 'bg-status-danger text-status-danger-ink',
        muted: 'bg-status-neutral text-status-neutral-ink',
      },
      /** A leading dot in the pill's own colour (status pills). */
      dot: {
        true: "before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      dot: false,
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, dot, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, dot }), className)} {...props} />;
}
