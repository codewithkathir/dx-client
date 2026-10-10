'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { payableService } from '@/features/payables/services/payable.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { BillListFilters, BillPayload, PaymentPayload } from '@/types/finance.types';

export function useBills(filters: BillListFilters) {
  return useQuery({
    queryKey: queryKeys.payables.list(filters),
    queryFn: () => payableService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePayablesSummary() {
  return useQuery({
    queryKey: queryKeys.payables.summary,
    queryFn: () => payableService.summary(),
  });
}

export function useBill(id: number | null) {
  return useQuery({
    queryKey: queryKeys.payables.detail(id ?? 0),
    queryFn: () => payableService.detail(id as number),
    enabled: id !== null,
  });
}

export function usePayableMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  // Payments on reimbursement bills also change expense statuses.
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.payables.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminExpenses.all });
  };
  const onSuccess = (message: string) => () => {
    invalidate();
    toast.success(message);
  };
  const onError = (err: unknown) => handleError(err);

  return {
    createBill: useMutation({
      mutationFn: (payload: BillPayload) => payableService.create(payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.CREATE),
      onError,
    }),
    updateBill: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<BillPayload> }) =>
        payableService.update(id, payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.UPDATE),
      onError,
    }),
    issueBill: useMutation({
      mutationFn: (id: number) => payableService.issue(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.BILL_ISSUED),
      onError,
    }),
    cancelBill: useMutation({
      mutationFn: (id: number) => payableService.cancel(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.BILL_CANCELLED),
      onError,
    }),
    deleteBill: useMutation({
      mutationFn: (id: number) => payableService.remove(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.DELETE),
      onError,
    }),
    uploadAttachment: useMutation({
      mutationFn: ({ id, file }: { id: number; file: File }) => payableService.uploadAttachment(id, file),
      onSuccess: onSuccess(SUCCESS_MESSAGES.ATTACHMENT_UPLOADED),
      onError,
    }),
    removeAttachment: useMutation({
      mutationFn: (id: number) => payableService.removeAttachment(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.ATTACHMENT_REMOVED),
      onError,
    }),
    recordPayment: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: PaymentPayload }) =>
        payableService.recordPayment(id, payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.PAYMENT_RECORDED),
      onError,
    }),
    deletePayment: useMutation({
      mutationFn: ({ id, paymentId }: { id: number; paymentId: number }) =>
        payableService.deletePayment(id, paymentId),
      onSuccess: onSuccess(SUCCESS_MESSAGES.PAYMENT_DELETED),
      onError,
    }),
  };
}
