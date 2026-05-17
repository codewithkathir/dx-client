import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/80 text-primary-foreground',
        secondary: 'border-transparent bg-secondary/80 text-secondary-foreground',
        outline: 'border-border text-foreground',
        success:
          'border-transparent bg-emerald-500/80 text-emerald-950 dark:text-emerald-50',
        warning: 'border-transparent bg-amber-500/80 text-amber-950 dark:text-amber-50',
        destructive: 'border-transparent bg-destructive/80 text-white',
        muted: 'border-transparent bg-muted/80 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
