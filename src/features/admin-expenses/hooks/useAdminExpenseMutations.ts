'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminExpenseService } from '@/features/admin-expenses/services/admin-expense.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { AdminExpenseStatus } from '@/types/expense.types';

export function useAdminExpenseMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminExpenses.all });
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, adminStatus }: { id: number; adminStatus: AdminExpenseStatus }) =>
      adminExpenseService.updateStatus(id, { adminStatus }),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.UPDATE);
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

  return { updateStatus, deleteExpense };
}
