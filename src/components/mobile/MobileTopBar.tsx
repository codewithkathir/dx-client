'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

interface MobileTopBarProps {
  title: string;
  backHref: string;
  /** Optional right-hand action (44×44). */
  action?: React.ReactNode;
  className?: string;
}

/** Back · centred title · action — the header of every pushed screen. */
export function MobileTopBar({ title, backHref, action, className }: MobileTopBarProps) {
  return (
    <header className={cn('sticky top-0 z-10 flex items-center gap-1 bg-card px-3 pt-3 pb-2', className)}>
      <Link href={backHref} aria-label="Back" className="flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-muted">
        <ChevronLeft className="size-[22px]" />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold">{title}</h1>
      <div className="flex size-11 items-center justify-center">{action}</div>
    </header>
  );
}
