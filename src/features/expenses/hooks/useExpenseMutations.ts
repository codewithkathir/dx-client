'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { expenseService } from '@/features/expenses/services/expense.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { CreateExpensePayload, UpdateExpensePayload } from '@/types/expense.types';

interface CreateExpenseVariables {
  payload: CreateExpensePayload;
  supportFile?: File | null;
}

interface UpdateExpenseVariables {
  id: number;
  payload: UpdateExpensePayload;
  supportFile?: File | null;
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  };

  const createExpense = useMutation({
    mutationFn: ({ payload, supportFile }: CreateExpenseVariables) =>
      expenseService.create(payload, supportFile),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, payload, supportFile }: UpdateExpenseVariables) =>
      expenseService.update(id, payload, supportFile),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: number) => expenseService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return { createExpense, updateExpense, deleteExpense };
}
