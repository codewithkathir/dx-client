'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { AccountEntryDialog } from '@/features/employee-accounts/components/AccountEntryDialog';
import { useEmployeeAccount } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/money.utils';

/**
 * Employee detail: their advance account at a glance, with Give advance and
 * the statement. Hidden if the admin can't see accounts.
 */
export function EmployeeAccountPanel({ employeeId }: { employeeId: number }) {
  const [giving, setGiving] = useState(false);
  const { data: account, isLoading, isError } = useEmployeeAccount(employeeId);
  if (isError) return null;

  return (
    <section aria-labelledby="emp-account">
      <h3 id="emp-account" className="mb-2.5 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase">
        Advance account
      </h3>
      {isLoading || !account ? (
        <Skeleton className="h-[76px] w-full rounded-xl" />
      ) : (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border px-4 py-3">
          <dl className="grid min-w-0 flex-1 grid-cols-3 gap-4">
            <div>
              <dt className="text-[13px] text-muted-foreground">Balance</dt>
              <dd className={cn('mt-0.5 text-base font-semibold tabular-nums', account.balance > 0 && 'text-status-success-ink')}>
                {formatMoney(account.balance)}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted-foreground">Pending claims</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {account.pendingClaims.count ? `${formatMoney(account.pendingClaims.amount)} (${account.pendingClaims.count})` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted-foreground">Owed to them</dt>
              <dd className={cn('mt-0.5 text-sm font-medium tabular-nums', account.owedToEmployee > 0 && 'text-destructive')}>
                {account.owedToEmployee > 0 ? formatMoney(account.owedToEmployee) : '—'}
              </dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href={ADMIN_ROUTES.EMPLOYEE_ACCOUNT_DETAIL(employeeId)} />}>
              <FileText className="size-4" />
              Statement
            </Button>
            <Button size="sm" onClick={() => setGiving(true)} disabled={account.employeeStatus !== 'active'}>
              <Plus className="size-4" />
              Give advance
            </Button>
          </div>
        </div>
      )}
      {account ? (
        <AccountEntryDialog
          kind={giving ? 'advance' : null}
          account={{ employeeId, employeeName: account.employeeName, balance: account.balance }}
          onClose={() => setGiving(false)}
        />
      ) : null}
    </section>
  );
}
