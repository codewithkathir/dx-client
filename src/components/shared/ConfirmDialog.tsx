'use client';

import { Check, Trash, TriangleAlert, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  /** "destructive" confirms with the solid red button; "success" for approvals. */
  variant?: 'default' | 'destructive' | 'success';
  /** Disable the confirm button (e.g. until a required reason is entered). */
  confirmDisabled?: boolean;
  /** Extra content between the text and the buttons, such as a reason field. */
  children?: React.ReactNode;
  /** Override the icon in the tile (defaults by variant). */
  icon?: LucideIcon;
  /** Override the tile colour (defaults by variant). */
  tone?: keyof typeof TILES;
}

const TILES = {
  blue: 'bg-brand-blue-50 text-primary',
  red: 'bg-status-danger text-destructive',
  green: 'bg-status-success text-status-success-ink',
  neutral: 'bg-muted text-[#33415a]',
} as const;

const ICONS: Record<NonNullable<ConfirmDialogProps['variant']>, { icon: LucideIcon; tone: keyof typeof TILES }> = {
  default: { icon: TriangleAlert, tone: 'blue' },
  destructive: { icon: Trash, tone: 'red' },
  success: { icon: Check, tone: 'green' },
};

/** Compact confirmation: icon tile, title, consequence, then Cancel / confirm (design "ModalApprove/Reject/Delete"). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onOpenChange,
  loading = false,
  variant = 'default',
  confirmDisabled = false,
  children,
  icon,
  tone,
}: ConfirmDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onCancel?.();
    }
    onOpenChange?.(next);
  };
  const Icon = icon ?? ICONS[variant].icon;
  const tile = TILES[tone ?? ICONS[variant].tone];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onClose={() => handleOpenChange(false)} className="max-w-[420px]">
        <DialogHeader className="border-b-0 pb-2">
          <span className={cn('mb-1.5 flex size-10 items-center justify-center rounded-xl', tile)} aria-hidden>
            <Icon className="size-5" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children ? <div className="px-6 pb-1">{children}</div> : null}
        <DialogFooter className="border-t-0 bg-transparent pt-3">
          <Button type="button" variant="outline" size="lg" disabled={loading} onClick={() => handleOpenChange(false)}>
            {cancelText}
          </Button>
          <Button loading={loading}
            type="button"
            size="lg"
            variant={variant === 'destructive' ? 'danger' : 'default'}
            disabled={loading || confirmDisabled}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
