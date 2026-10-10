'use client';

import { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import type { Matcher } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';

/** YYYY-MM-DD → local-midnight Date (new Date('YYYY-MM-DD') would be UTC). */
export function isoToDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Local Date → YYYY-MM-DD. */
export function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface DatePickerProps {
  id?: string;
  /** YYYY-MM-DD, or empty / null when nothing is picked. */
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Earliest selectable date (YYYY-MM-DD, inclusive). */
  min?: string;
  /** Latest selectable date (YYYY-MM-DD, inclusive). */
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Shows a clear button; picking nothing sends ''. */
  clearable?: boolean;
  /** Month/year dropdowns, for dates far from today (e.g. date of birth). */
  yearDropdown?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  placeholder = 'Pick a date',
  disabled,
  clearable,
  yearDropdown,
  className,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? isoToDate(value) : undefined;
  const minDate = min ? isoToDate(min) : undefined;
  const maxDate = max ? isoToDate(max) : undefined;

  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  const thisYear = new Date().getFullYear();

  return (
    <div className={cn('relative', className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
      >
        <PopoverTrigger
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            'flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-input-border bg-input px-2.5 py-1 text-left text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
            clearable && selected && 'pr-8',
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {value && selected ? formatExpenseDate(value) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? maxDate ?? minDate}
            disabled={disabledDays}
            startMonth={minDate ?? (yearDropdown ? new Date(thisYear - 100, 0) : undefined)}
            endMonth={maxDate ?? (yearDropdown ? new Date(thisYear + 20, 11) : undefined)}
            captionLayout={yearDropdown ? 'dropdown' : 'label'}
            onSelect={(date) => {
              if (!date) return;
              onChange(dateToIso(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {clearable && selected && !disabled ? (
        <button
          type="button"
          aria-label="Clear date"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => onChange('')}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
