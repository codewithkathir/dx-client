import { AlertTriangle, CalendarCheck, FileClock, HandCoins } from 'lucide-react';

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
}

/** Outstanding / overdue / settled-this-month / drafts cards for Payables and Receivables. */
export function MoneySummaryCards({ summary, isLoading, documentNoun, settledLabel }: MoneySummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!summary) return null;

  const cards = [
    {
      label: 'Outstanding',
      value: formatMoney(summary.outstandingAmount),
      hint: `${summary.outstandingCount} unpaid ${documentNoun}${summary.outstandingCount === 1 ? '' : 's'}`,
      icon: HandCoins,
      accent: 'border-border bg-gradient-to-br from-card to-muted/30',
    },
    {
      label: 'Overdue',
      value: formatMoney(summary.overdueAmount),
      hint: `${summary.overdueCount} past due date`,
      icon: AlertTriangle,
      accent: summary.overdueCount > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border',
    },
    {
      label: settledLabel,
      value: formatMoney(summary.settledThisMonth),
      hint: 'Since the 1st of this month',
      icon: CalendarCheck,
      accent: 'border-emerald-500/30 bg-emerald-500/5',
    },
    {
      label: 'Drafts',
      value: String(summary.draftCount),
      hint: 'Not yet issued',
      icon: FileClock,
      accent: 'border-border',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon, accent }) => (
        <Card key={label} className={cn('p-5 shadow-sm', accent)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
            <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </div>
        </Card>
      ))}
    </div>
  );
}
