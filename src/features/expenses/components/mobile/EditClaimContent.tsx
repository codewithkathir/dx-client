'use client';

import { useParams, useRouter } from 'next/navigation';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { Skeleton } from '@/components/ui/skeleton';
import { USER_ROUTES } from '@/constants/routes.constants';
import { ClaimForm } from '@/features/expenses/components/mobile/ClaimForm';
import { useExpenseMutations } from '@/features/expenses/hooks/useExpenseMutations';
import { useExpense } from '@/features/expenses/hooks/useExpenseQueries';
import { isClaimEditable } from '@/features/expenses/utils/claim.utils';

export function EditClaimContent() {
  const router = useRouter();
  const id = Number(useParams<{ id: string }>().id);
  const { data: claim, isLoading, isError, error, refetch } = useExpense(Number.isInteger(id) ? id : undefined);
  const { updateExpense } = useExpenseMutations();
  const back = USER_ROUTES.EXPENSE_DETAIL(id);

  return (
    <div className="flex min-h-full flex-col bg-card">
      <MobileTopBar title="Edit claim" backHref={back} className="border-b border-border" />
      {isError ? (
        <div className="p-5">
          <ErrorPanel message={error?.message ?? "Couldn't load this claim"} onRetry={() => refetch()} />
        </div>
      ) : isLoading || !claim ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !isClaimEditable(claim) ? (
        <div className="p-5">
          <ErrorPanel title="This claim can't be changed" message="An administrator has already reviewed it." />
        </div>
      ) : (
        <ClaimForm
          expense={claim}
          isSubmitting={updateExpense.isPending}
          onSubmit={(payload, receipt) =>
            updateExpense.mutate({ id: claim.id, payload, supportFile: receipt }, { onSuccess: () => router.replace(back) })
          }
        />
      )}
    </div>
  );
}
