'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { productService } from '@/features/products/services/product.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type { ProductListFilters, ProductPayload } from '@/types/product.types';

export function useProducts(filters: ProductListFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useProductOptions() {
  return useQuery({
    queryKey: queryKeys.products.options,
    queryFn: () => productService.options(),
    staleTime: 60_000,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });

  const createProduct = useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => productService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  return { createProduct, updateProduct };
}
