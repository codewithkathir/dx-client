'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supplierService } from '@/features/suppliers/services/supplier.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { PartyListFilters, SupplierPayload } from '@/types/finance.types';

export function useSuppliers(filters: PartyListFilters) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(filters),
    queryFn: () => supplierService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useSupplierOptions() {
  return useQuery({
    queryKey: queryKeys.suppliers.options,
    queryFn: () => supplierService.options(),
    staleTime: 60_000,
  });
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });

  const createSupplier = useMutation({
    mutationFn: (payload: SupplierPayload) => supplierService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateSupplier = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupplierPayload }) =>
      supplierService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteSupplier = useMutation({
    mutationFn: (id: number) => supplierService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return { createSupplier, updateSupplier, deleteSupplier };
}
