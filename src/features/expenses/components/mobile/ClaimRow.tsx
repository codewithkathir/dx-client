import Link from 'next/link';
import { ArrowDownLeft, Check, Receipt, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { USER_ROUTES } from '@/constants/routes.constants';
import { getExpenseStage } from '@/features/expenses/components/ExpenseStageBadge';
import { claimStage, shortDate } from '@/features/expenses/utils/claim.utils';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseStage } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

const STAGE_TILE: Record<ExpenseStage, { icon: LucideIcon; className: string }> = {
  pending: { icon: Receipt, className: 'bg-status-warning text-status-warning-ink' },
  approved: { icon: Check, className: 'bg-brand-blue-50 text-brand-blue-hover' },
  paid: { icon: ArrowDownLeft, className: 'bg-status-success text-status-success-ink' },
  rejected: { icon: X, className: 'bg-status-danger text-destructive' },
};

interface ClaimRowProps {
  expense: Expense;
  title: string;
  /** Second line, e.g. "07 Oct · Meals › Client entertainment" (list) — omitted on Home. */
  meta?: string;
  showIcon?: boolean;
}

/** One claim in a list: tile · title · stage pill · amount. Taps through to the claim. */
export function ClaimRow({ expense, title, meta, showIcon = true }: ClaimRowProps) {
  const stage = claimStage(expense);
  const pill = getExpenseStage(expense);
  const tile = STAGE_TILE[stage];
  const paidOn = stage === 'paid' ? expense.reimbursement?.lastPaymentDate : null;

  return (
    <Link
      href={USER_ROUTES.EXPENSE_DETAIL(expense.id)}
      className="flex items-center gap-3 px-4 py-3.5 text-foreground transition-colors not-first:border-t not-first:border-border hover:bg-muted/50"
    >
      {showIcon ? (
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tile.className)} aria-hidden>
          <tile.icon className="size-5" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title}</span>
        {meta ? <span className="mt-0.5 mb-1.5 block truncate text-xs text-muted-foreground">{meta}</span> : null}
        <span className={cn('flex items-center gap-1.5', !meta && 'mt-1')}>
          <Badge variant={pill.variant}>{pill.label}</Badge>
          {paidOn && !meta ? <span className="text-xs text-muted-foreground">on {shortDate(paidOn)}</span> : null}
        </span>
      </span>
      <span className={cn('shrink-0 text-[15px] font-semibold tabular-nums', stage === 'paid' && !meta && 'text-status-success-ink')}>
        {stage === 'paid' && !meta ? '+ ' : ''}
        {formatMoney(expense.amount)}
      </span>
    </Link>
  );
}
