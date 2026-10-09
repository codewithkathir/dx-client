'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { receivableService } from '@/features/receivables/services/receivable.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { InvoiceListFilters, InvoicePayload, ReceiptPayload } from '@/types/finance.types';

export function useInvoices(filters: InvoiceListFilters) {
  return useQuery({
    queryKey: queryKeys.receivables.list(filters),
    queryFn: () => receivableService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useReceivablesSummary() {
  return useQuery({
    queryKey: queryKeys.receivables.summary,
    queryFn: () => receivableService.summary(),
  });
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: queryKeys.receivables.detail(id ?? 0),
    queryFn: () => receivableService.detail(id as number),
    enabled: id !== null,
  });
}

export function useReceivableMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const onSuccess = (message: string) => () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.receivables.all });
    toast.success(message);
  };
  const onError = (err: unknown) => handleError(err);

  return {
    createInvoice: useMutation({
      mutationFn: (payload: InvoicePayload) => receivableService.create(payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.CREATE),
      onError,
    }),
    updateInvoice: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<InvoicePayload> }) =>
        receivableService.update(id, payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.UPDATE),
      onError,
    }),
    sendInvoice: useMutation({
      mutationFn: (id: number) => receivableService.send(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.INVOICE_SENT),
      onError,
    }),
    cancelInvoice: useMutation({
      mutationFn: (id: number) => receivableService.cancel(id),
      onSuccess: onSuccess(SUCCESS_MESSAGES.INVOICE_CANCELLED),
      onError,
    }),
    recordReceipt: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: ReceiptPayload }) =>
        receivableService.recordReceipt(id, payload),
      onSuccess: onSuccess(SUCCESS_MESSAGES.RECEIPT_RECORDED),
      onError,
    }),
    deleteReceipt: useMutation({
      mutationFn: ({ id, receiptId }: { id: number; receiptId: number }) =>
        receivableService.deleteReceipt(id, receiptId),
      onSuccess: onSuccess(SUCCESS_MESSAGES.RECEIPT_DELETED),
      onError,
    }),
    downloadPdf: useMutation({
      mutationFn: async ({ id, invoiceNo }: { id: number; invoiceNo: string }) => {
        const blob = await receivableService.downloadPdf(id);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceNo}.pdf`;
        link.click();
        // Give the browser a moment to start the download before releasing the blob.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      },
      onError,
    }),
  };
}
