import { CalendarCheck, FileClock, HandCoins, TriangleAlert, type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/money.utils';

export interface MoneySummary {
  outstandingAmount: number;
  outstandingCount: number;
  overdueAmount: number;
  overdueCount: number;
  /** Paid out (payables) or received (receivables) since the 1st of the month. */
  settledThisMonth: number;
  draftCount: number;
}

interface MoneySummaryCardsProps {
  summary: MoneySummary | undefined;
  isLoading: boolean;
  /** e.g. "bill" or "invoice" */
  documentNoun: string;
  settledLabel: string;
  /** Money received is shown in green (receivables); money paid out is not. */
  highlightSettled?: boolean;
}

export type StatTone = 'plain' | 'outstanding' | 'overdue' | 'settled' | 'pending';
export type StatIconColor = 'muted' | 'blue' | 'green' | 'red' | 'amber';

/** Card tints from the design system: blue = owed, red = overdue, green = settled money. */
const TONE_CARD: Record<StatTone, string> = {
  plain: '',
  outstanding: 'bg-gradient-to-br from-card to-brand-blue-50',
  overdue: 'border-[color-mix(in_oklch,var(--destructive)_30%,var(--card))] bg-gradient-to-br from-card to-status-danger',
  settled: 'border-[color-mix(in_oklch,var(--status-success-ink)_30%,var(--card))] bg-gradient-to-br from-card to-status-success',
  pending: 'border-[#f3dfb3] bg-gradient-to-br from-card to-status-warning',
};

/** Icons are grey unless the figure needs attention (design ".dx-stat svg"). */
const TONE_ICON: Record<StatTone, StatIconColor> = {
  plain: 'muted',
  outstanding: 'muted',
  overdue: 'red',
  settled: 'green',
  pending: 'amber',
};

const ICON_COLOR: Record<StatIconColor, string> = {
  muted: 'text-muted-foreground',
  blue: 'text-primary',
  green: 'text-status-success-ink',
  red: 'text-destructive',
  amber: 'text-status-warning-ink',
};

const VALUE_COLOR: Partial<Record<StatTone, string>> = {
  overdue: 'text-destructive',
  settled: 'text-status-success-ink',
};

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
  /** Highlight the figure in the tone's colour (overdue, settled). */
  toneValue?: boolean;
  /** Override the icon colour (defaults by tone). */
  iconColor?: StatIconColor;
  /** Show the icon in a 40px tile (Expenses summary). */
  iconTile?: boolean;
}

/** A single summary figure (design system "dx-stat"). */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'plain',
  toneValue = false,
  iconColor,
  iconTile = false,
}: StatCardProps) {
  const color = ICON_COLOR[iconColor ?? TONE_ICON[tone]];
  return (
    <Card className={cn('animate-in fade-in-0 slide-in-from-bottom-1 flex-row items-start justify-between gap-3 p-5 shadow-sm duration-300', TONE_CARD[tone])}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={cn('mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight', toneValue && VALUE_COLOR[tone])}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {iconTile ? (
        <span
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[10px]',
            tone === 'outstanding' ? 'bg-brand-blue-50' : 'bg-card shadow-sm',
            color,
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : (
        <Icon className={cn('size-5 shrink-0', color)} aria-hidden />
      )}
    </Card>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[118px] rounded-xl" />
      ))}
    </div>
  );
}

/** Outstanding / overdue / settled-this-month / drafts cards for Payables and Receivables. */
export function MoneySummaryCards({
  summary,
  isLoading,
  documentNoun,
  settledLabel,
  highlightSettled = false,
}: MoneySummaryCardsProps) {
  if (isLoading) return <StatCardsSkeleton />;
  if (!summary) return null;
  const plural = (n: number) => `${n} ${documentNoun}${n === 1 ? '' : 's'}`;

  return (
    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Outstanding"
        value={formatMoney(summary.outstandingAmount)}
        hint={`${summary.outstandingCount} unpaid ${documentNoun}${summary.outstandingCount === 1 ? '' : 's'}`}
        icon={HandCoins}
        tone="outstanding"
      />
      <StatCard
        label="Overdue"
        value={formatMoney(summary.overdueAmount)}
        hint={`${plural(summary.overdueCount)} past due date`}
        icon={TriangleAlert}
        tone={summary.overdueCount > 0 ? 'overdue' : 'plain'}
        toneValue={summary.overdueCount > 0}
      />
      <StatCard
        label={settledLabel}
        value={formatMoney(summary.settledThisMonth)}
        hint="Since the 1st of this month"
        icon={CalendarCheck}
        tone="settled"
        toneValue={highlightSettled}
      />
      <StatCard label="Drafts" value={String(summary.draftCount)} hint="Not yet issued" icon={FileClock} />
    </section>
  );
}
