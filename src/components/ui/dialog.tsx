'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Portal } from '@/components/ui/portal';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** When false, clicking the backdrop does not close the dialog. Defaults to false. */
  closeOnOutsideClick?: boolean;
}

export function Dialog({ open, onOpenChange, children, closeOnOutsideClick = false }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {closeOnOutsideClick ? (
          <button
            type="button"
            className="absolute inset-0 animate-in bg-[var(--scrim)] backdrop-blur-[3px] fade-in-0 duration-200"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
          />
        ) : (
          <div
            className="absolute inset-0 animate-in bg-[var(--scrim)] backdrop-blur-[3px] fade-in-0 duration-200"
            aria-hidden
          />
        )}
        {children}
      </div>
    </Portal>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function DialogContent({ className, children, onClose }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-10 flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[20px] bg-card shadow-dialog fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200',
        className,
      )}
      role="dialog"
      aria-modal="true"
    >
      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-20 size-9 rounded-[10px] text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      ) : null}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-b border-border px-6 pt-[22px] pb-[18px] pr-16',
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[19px] leading-7 font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-y-auto px-6 py-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2.5 border-t border-border bg-card px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
