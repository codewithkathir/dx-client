'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

const PANEL_WIDTH = 320;
const PANEL_GAP = 6;

const EMPTY_RANGE: DateRange = { from: undefined, to: undefined };

function normalizeRange(from?: string, to?: string): DateRange {
  const f = from?.trim() || undefined;
  const t = to?.trim() || undefined;
  if (!f && !t) return EMPTY_RANGE;
  if (f && t && f > t) {
    return { from: t, to: f };
  }
  return { from: f, to: t };
}

function formatRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return '';
  if (from && to) return `${formatExpenseDate(from)} – ${formatExpenseDate(to)}`;
  if (from) return `From ${formatExpenseDate(from)}`;
  return `Until ${formatExpenseDate(to!)}`;
}

function computePanelPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
  let left = rect.left;
  const maxLeft = window.innerWidth - width - 8;
  if (left > maxLeft) left = Math.max(8, maxLeft);
  if (left < 8) left = 8;

  const estimatedHeight = 280;
  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
  const spaceAbove = rect.top - PANEL_GAP;
  const openAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

  const top = openAbove
    ? Math.max(8, rect.top - estimatedHeight - PANEL_GAP)
    : rect.bottom + PANEL_GAP;

  return { top, left, width };
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Date range',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draftFrom, setDraftFrom] = useState(value.from ?? '');
  const [draftTo, setDraftTo] = useState(value.to ?? '');
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftFrom(value.from ?? '');
    setDraftTo(value.to ?? '');
  }, [value.from, value.to]);

  useEffect(() => {
    if (open) {
      setDraftFrom(value.from ?? '');
      setDraftTo(value.to ?? '');
    }
  }, [open, value.from, value.to]);

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelPosition(computePanelPosition(triggerRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPosition(null);
      return;
    }
    updatePanelPosition();
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePanelPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const label = formatRangeLabel(value.from, value.to);
  const hasValue = Boolean(value.from || value.to);

  const clearRange = () => {
    onChange(EMPTY_RANGE);
    setDraftFrom('');
    setDraftTo('');
    setOpen(false);
  };

  const applyDraft = () => {
    onChange(normalizeRange(draftFrom, draftTo));
    setOpen(false);
  };

  const panel =
    open && panelPosition && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Select date range"
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
            className="z-[200] rounded-xl border border-border bg-popover p-4 shadow-lg"
          >
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${panelId}-from`}>From</Label>
                <Input
                  id={`${panelId}-from`}
                  type="date"
                  value={draftFrom}
                  max={draftTo || undefined}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${panelId}-to`}>To</Label>
                <Input
                  id={`${panelId}-to`}
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={clearRange}
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyDraft}>
                  Apply
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={cn('flex gap-1', className)}>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          className={cn(
            'h-10 min-w-0 flex-1 justify-start gap-2 px-3 font-normal',
            !hasValue && 'text-muted-foreground',
          )}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
        >
          <Calendar className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{label || placeholder}</span>
        </Button>
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
      {panel}
    </>
  );
}
