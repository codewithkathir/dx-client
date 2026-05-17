'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** When false, clicking the backdrop does not close the dialog. Defaults to false. */
  closeOnOutsideClick?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  closeOnOutsideClick = false,
}: DialogProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {closeOnOutsideClick ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-label="Close dialog"
          onClick={() => onOpenChange(false)}
        />
      ) : (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      )}
      {children}
    </div>
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
        'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
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
          className="absolute right-3 top-3 z-20"
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
    <div className={cn('flex flex-col gap-1 border-b border-border px-6 py-4 pr-12', className)} {...props} />
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-y-auto px-6 py-4', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
