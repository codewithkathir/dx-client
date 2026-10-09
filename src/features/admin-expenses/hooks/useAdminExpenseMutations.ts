'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminExpenseService } from '@/features/admin-expenses/services/admin-expense.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';

export function useAdminExpenseMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  // Decisions create or cancel reimbursement bills, so Payables is refreshed too.
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminExpenses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.payables.all });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const approveExpense = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string | null }) => adminExpenseService.approve(id, note),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.EXPENSE_APPROVED);
    },
    onError: (err) => handleError(err),
  });

  const rejectExpense = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => adminExpenseService.reject(id, note),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.EXPENSE_REJECTED);
    },
    onError: (err) => handleError(err),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: number) => adminExpenseService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return { approveExpense, rejectExpense, deleteExpense };
}
