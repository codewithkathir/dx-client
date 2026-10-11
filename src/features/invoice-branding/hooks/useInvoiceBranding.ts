'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invoiceBrandingService } from '@/features/invoice-branding/services/invoice-branding.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { BrandingImageKind, InvoiceBranding, InvoiceBrandingPayload } from '@/types/invoice-branding.types';

export function useInvoiceBranding() {
  return useQuery({
    queryKey: queryKeys.invoiceBranding,
    queryFn: () => invoiceBrandingService.getBranding(),
  });
}

export function useInvoiceBrandingMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const saved = (branding: InvoiceBranding) => queryClient.setQueryData(queryKeys.invoiceBranding, branding);

  const updateDetails = useMutation({
    mutationFn: (payload: InvoiceBrandingPayload) => invoiceBrandingService.update(payload),
    onSuccess: (branding) => {
      saved(branding);
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const uploadImage = useMutation({
    mutationFn: ({ kind, file }: { kind: BrandingImageKind; file: File }) => invoiceBrandingService.uploadImage(kind, file),
    onSuccess: (branding) => {
      saved(branding);
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const removeImage = useMutation({
    mutationFn: (kind: BrandingImageKind) => invoiceBrandingService.removeImage(kind),
    onSuccess: (branding) => {
      saved(branding);
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return { updateDetails, uploadImage, removeImage };
}
