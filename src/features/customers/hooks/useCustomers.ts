'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { customerService } from '@/features/customers/services/customer.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { PartyListFilters, CustomerPayload } from '@/types/finance.types';

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
    mutationFn: (payload: CustomerPayload) => customerService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerPayload }) =>
      customerService.update(id, payload),
    onSuccess: () => {
      invalidate();
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
