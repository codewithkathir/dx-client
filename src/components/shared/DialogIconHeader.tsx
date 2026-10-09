import type { LucideIcon } from 'lucide-react';

import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TILES = {
  blue: 'bg-brand-blue-50 text-primary',
  green: 'bg-status-success text-status-success-ink',
  red: 'bg-status-danger text-destructive',
} as const;

interface DialogIconHeaderProps {
  icon: LucideIcon;
  tone?: keyof typeof TILES;
  title: string;
  description?: React.ReactNode;
  /** Shown beside the title, e.g. a status badge. */
  badge?: React.ReactNode;
  /** Small pill above the title, e.g. "Level 2". */
  eyebrow?: string;
}

/** Dialog header with an icon tile (design "mdl-h"). */
export function DialogIconHeader({ icon: Icon, tone = 'blue', title, description, badge, eyebrow }: DialogIconHeaderProps) {
  return (
    <DialogHeader className="flex-row items-start gap-3.5">
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', TILES[tone])} aria-hidden>
        <Icon className="size-[22px]" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? (
          <span className="self-start rounded-full bg-brand-blue-50 px-2.5 py-0.5 text-xs font-semibold text-brand-blue-hover">
            {eyebrow}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <DialogTitle>{title}</DialogTitle>
          {badge}
        </div>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </div>
    </DialogHeader>
  );
}
