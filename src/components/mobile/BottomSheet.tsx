'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Portal } from '@/components/ui/portal';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** Icon tile above the title (confirm sheets). */
  icon?: LucideIcon;
  tone?: 'blue' | 'red';
  /** Shows a "Cancel" link beside the title (form sheets). */
  showCancel?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const TILE = { blue: 'bg-brand-blue-50 text-primary', red: 'bg-status-danger text-destructive' };

/** Design "msh": a sheet that slides up from the bottom of the phone frame. */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  tone = 'blue',
  showCancel = false,
  children,
  className,
}: BottomSheetProps) {
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-center">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 animate-in bg-[rgba(15,28,46,.45)] fade-in-0 duration-200"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'absolute bottom-0 flex max-h-[92dvh] w-full max-w-[480px] animate-in flex-col gap-4 overflow-y-auto rounded-t-[24px] bg-card px-5 pt-2.5 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-8px_rgba(15,28,46,.25)] slide-in-from-bottom-full duration-300 ease-out',
            className,
          )}
        >
          <span
            className="h-[5px] w-10 shrink-0 self-center rounded-full bg-[#c9d1dd]"
            aria-hidden
          />
          {Icon ? (
            <span
              className={cn('flex size-[52px] items-center justify-center rounded-2xl', TILE[tone])}
              aria-hidden
            >
              <Icon className="size-[26px]" />
            </span>
          ) : null}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-xl leading-7 font-semibold tracking-[-0.02em]">
                {title}
              </h2>
              {showCancel ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[15px] font-medium text-primary"
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}
