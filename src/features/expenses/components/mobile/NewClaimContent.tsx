'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { mobileButton } from '@/components/mobile/mobile.styles';
import { USER_ROUTES } from '@/constants/routes.constants';
import { ClaimForm } from '@/features/expenses/components/mobile/ClaimForm';
import { useClaimLabels } from '@/features/expenses/hooks/useClaimLabels';
import { useExpenseMutations } from '@/features/expenses/hooks/useExpenseMutations';
import type { Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

/** Design "MobileNewExpense" → "MobileSubmitted". */
export function NewClaimContent() {
  const { createExpense } = useExpenseMutations();
  const [submitted, setSubmitted] = useState<Expense | null>(null);

  if (submitted) return <ClaimSubmitted claim={submitted} />;

  return (
    <div className="flex min-h-full flex-col bg-card">
      <MobileTopBar title="New expense" backHref={USER_ROUTES.HOME} className="border-b border-border" />
      <ClaimForm
        isSubmitting={createExpense.isPending}
        onSubmit={(payload, receipt) =>
          createExpense.mutate({ payload, supportFile: receipt }, { onSuccess: (claim) => setSubmitted(claim) })
        }
      />
    </div>
  );
}

function ClaimSubmitted({ claim }: { claim: Expense }) {
  const { title } = useClaimLabels([claim]);
  return (
    <div className="flex min-h-full flex-col bg-card px-6 pt-6 pb-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="relative size-28" aria-hidden>
          <div className="absolute inset-0 rounded-full bg-status-success" />
          <div className="absolute inset-[18px] flex items-center justify-center rounded-full bg-brand-green-600 text-white">
            <Check className="size-10" strokeWidth={3} />
          </div>
        </div>
        <div>
          <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.025em]">Claim submitted</h1>
          <p className="mt-2 text-[15px] leading-[22px] text-muted-foreground">
            {formatMoney(claim.amount)} for {title(claim)} is with your administrator. Check back here to see when it&apos;s approved.
          </p>
        </div>
        <div className="flex w-full justify-between rounded-[14px] border border-border px-4 py-3.5 text-sm">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-semibold">Claim #{claim.id}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Link href={USER_ROUTES.EXPENSE_DETAIL(claim.id)} className={mobileButton('primary')}>
          View claim
        </Link>
        <Link href={USER_ROUTES.HOME} className={mobileButton('plain')}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
