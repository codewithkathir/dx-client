import type { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';

interface SegmentedRadioProps {
  options: ReadonlyArray<{ value: string; label: string }>;
  /** `register('status')` — the options are plain radio inputs, so RHF handles them natively. */
  registration: UseFormRegisterReturn;
  /** Accessible name of the group. */
  label: string;
  /** Put on the first option so a <label htmlFor> can target the group. */
  id?: string;
  className?: string;
}

/** Design "seg": a two- or three-way switch, e.g. Active / Inactive. */
export function SegmentedRadio({ options, registration, label, id, className }: SegmentedRadioProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid gap-1 rounded-[10px] bg-muted p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, i) => (
        <label key={option.value} className="relative">
          <input type="radio" value={option.value} id={i === 0 ? id : undefined} className="peer sr-only" {...registration} />
          <span
            className={cn(
              'flex h-8 items-center justify-center rounded-[7px] text-[13px] font-medium text-muted-foreground transition-all',
              'peer-checked:bg-card peer-checked:font-semibold peer-checked:text-foreground peer-checked:shadow-[0_1px_2px_rgba(15,28,46,.08),0_1px_3px_rgba(15,28,46,.1)]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50',
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
