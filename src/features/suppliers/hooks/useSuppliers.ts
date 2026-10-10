'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supplierService } from '@/features/suppliers/services/supplier.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { PartyListFilters, PartyPhotoChange, SupplierPayload } from '@/types/finance.types';

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
    mutationFn: async ({ payload, photo }: { payload: SupplierPayload; photo?: PartyPhotoChange }) => {
      const created = await supplierService.create(payload);
      await supplierService.applyPhotoChange(created.id, photo).catch(handleError);
      return created;
    },
    // A failed picture upload is reported on its own; the record is still saved.
    onSettled: invalidate,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, payload, photo }: { id: number; payload: SupplierPayload; photo?: PartyPhotoChange }) => {
      const updated = await supplierService.update(id, payload);
      await supplierService.applyPhotoChange(id, photo).catch(handleError);
      return updated;
    },
    onSettled: invalidate,
    onSuccess: () => {
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
