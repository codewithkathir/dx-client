'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange as DayPickerRange } from 'react-day-picker';

import { dateToIso, isoToDate } from '@/components/forms/DatePicker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { cn } from '@/lib/utils';

export interface DateRange {
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

const EMPTY_RANGE: DateRange = { from: undefined, to: undefined };

function formatRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return '';
  if (from && to) return from === to ? formatExpenseDate(from) : `${formatExpenseDate(from)} – ${formatExpenseDate(to)}`;
  if (from) return `From ${formatExpenseDate(from)}`;
  return `Until ${formatExpenseDate(to!)}`;
}

function toDayPickerRange(range: DateRange): DayPickerRange | undefined {
  const from = range.from ? isoToDate(range.from) : undefined;
  const to = range.to ? isoToDate(range.to) : undefined;
  return from || to ? { from, to } : undefined;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Date range',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayPickerRange | undefined>(() => toDayPickerRange(value));

  const label = formatRangeLabel(value.from, value.to);
  const hasValue = Boolean(value.from || value.to);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(toDayPickerRange(value));
    setOpen(next);
  };

  const clearRange = () => {
    onChange(EMPTY_RANGE);
    setDraft(undefined);
    setOpen(false);
  };

  // A single picked day filters that day only; the calendar keeps from <= to.
  const applyDraft = () => {
    const from = draft?.from ? dateToIso(draft.from) : undefined;
    const to = draft?.to ? dateToIso(draft.to) : from;
    onChange(from || to ? { from, to } : EMPTY_RANGE);
    setOpen(false);
  };

  return (
    <div className={cn('flex gap-1', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn('h-10 min-w-0 flex-1 justify-start gap-2 px-3 font-normal', !hasValue && 'text-muted-foreground')}
            />
          }
        >
          <CalendarIcon className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{label || placeholder}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" aria-label="Select date range">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from ?? draft?.to}
          />
          <div className="flex items-center justify-between gap-2 border-t border-border p-2">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={clearRange}>
              Clear
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={applyDraft} disabled={!draft?.from}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasValue ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={clearRange}
          aria-label="Clear date range"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
