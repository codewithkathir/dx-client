'use client';

import Link from 'next/link';
import { ChevronRight, Wallet } from 'lucide-react';

import { USER_ROUTES } from '@/constants/routes.constants';
import { useMyAccount } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { formatMoney } from '@/utils/money.utils';

/** Employee home: the advance they hold, if they've ever had one. */
export function MyAccountCard() {
  const { data: account } = useMyAccount();
  if (!account || (account.totalAdvanced === 0 && account.balance === 0)) return null;
  return (
    <Link
      href={USER_ROUTES.ACCOUNT}
      className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/50"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-status-success text-status-success-ink" aria-hidden>
        <Wallet className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-muted-foreground">Advance balance</span>
        <span className="block text-lg font-semibold tabular-nums">{formatMoney(account.balance)}</span>
        <span className="block text-xs text-muted-foreground">Your approved claims are paid from this first</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
