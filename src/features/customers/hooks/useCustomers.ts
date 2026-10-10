'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { customerService } from '@/features/customers/services/customer.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { PartyListFilters, PartyPhotoChange, CustomerPayload } from '@/types/finance.types';

export function useCustomers(filters: PartyListFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customerService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCustomerOptions() {
  return useQuery({
    queryKey: queryKeys.customers.options,
    queryFn: () => customerService.options(),
    staleTime: 60_000,
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });

  const createCustomer = useMutation({
    mutationFn: async ({ payload, photo }: { payload: CustomerPayload; photo?: PartyPhotoChange }) => {
      const created = await customerService.create(payload);
      await customerService.applyPhotoChange(created.id, photo).catch(handleError);
      return created;
    },
    // A failed picture upload is reported on its own; the record is still saved.
    onSettled: invalidate,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, payload, photo }: { id: number; payload: CustomerPayload; photo?: PartyPhotoChange }) => {
      const updated = await customerService.update(id, payload);
      await customerService.applyPhotoChange(id, photo).catch(handleError);
      return updated;
    },
    onSettled: invalidate,
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: number) => customerService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return { createCustomer, updateCustomer, deleteCustomer };
}
