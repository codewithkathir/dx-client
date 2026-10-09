'use client';

import { CircleX } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminExpenseMutations } from '@/features/admin-expenses/hooks/useAdminExpenseMutations';
import type { Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

export type ExpenseDecision = { expense: Expense; action: 'approve' | 'reject'; employeeName: string };

interface ExpenseDecisionDialogsProps {
  decision: ExpenseDecision | null;
  onClose: () => void;
  onDone?: (updated: Expense) => void;
}

/** Approve (confirm) and Reject (with a required reason the employee sees). */
export function ExpenseDecisionDialogs({ decision, onClose, onDone }: ExpenseDecisionDialogsProps) {
  const { approveExpense, rejectExpense } = useAdminExpenseMutations();
  const [reason, setReason] = useState('');
  const close = () => {
    setReason('');
    onClose();
  };
  const finish = (updated: Expense) => {
    setReason('');
    onDone?.(updated);
    onClose();
  };

  if (!decision) return null;
  const amount = formatMoney(decision.expense.amount);

  return decision.action === 'approve' ? (
    <ConfirmDialog
      open
      variant="success"
      title="Approve claim"
      description={`Approve ${amount} for ${decision.employeeName}? This creates a reimbursement bill in Payables.`}
      confirmText="Approve"
      loading={approveExpense.isPending}
      onConfirm={() => approveExpense.mutate({ id: decision.expense.id }, { onSuccess: finish })}
      onCancel={close}
    />
  ) : (
    <ConfirmDialog
      open
      variant="destructive"
      icon={CircleX}
        title="Reject claim"
      description={`${decision.employeeName} will see your reason.${
        decision.expense.reimbursement && decision.expense.reimbursement.status !== 'cancelled'
          ? ` Its unpaid reimbursement ${decision.expense.reimbursement.billNo} will be cancelled.`
          : ''
      }`}
      confirmText="Reject"
      confirmDisabled={reason.trim().length === 0}
      loading={rejectExpense.isPending}
      onConfirm={() => rejectExpense.mutate({ id: decision.expense.id, note: reason.trim() }, { onSuccess: finish })}
      onCancel={close}
    >
      <Label htmlFor="reject-reason" className="mb-2">
        Reason
      </Label>
      <Textarea
        id="reject-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={1000}
        placeholder="e.g. Please attach the itemised receipt"
        className="min-h-16"
        autoFocus
      />
    </ConfirmDialog>
  );
}
