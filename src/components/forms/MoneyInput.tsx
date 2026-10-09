import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Amount field with a fixed "AED" prefix (design system money input). */
export const MoneyInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & { currency?: string }>(
  ({ className, currency = 'AED', ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-foreground" aria-hidden>
        {currency}
      </span>
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0.01"
        className={cn('pl-[46px] tabular-nums', className)}
        {...props}
      />
    </div>
  ),
);
MoneyInput.displayName = 'MoneyInput';
