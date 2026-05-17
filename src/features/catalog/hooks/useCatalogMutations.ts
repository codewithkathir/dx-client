'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { catalogService } from '@/features/catalog/services/catalog.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import type {
  CreateCategoryPayload,
  CreateSubCategoryPayload,
  CreateSubSubCategoryPayload,
  UpdateCategoryPayload,
  UpdateSubCategoryPayload,
  UpdateSubSubCategoryPayload,
} from '@/types/catalog.types';

export function useCatalogMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
  };

  const createCategory = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => catalogService.createCategory(payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryPayload }) =>
      catalogService.updateCategory(id, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => catalogService.deleteCategory(id),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  const createSubCategory = useMutation({
    mutationFn: (payload: CreateSubCategoryPayload) => catalogService.createSubCategory(payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateSubCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSubCategoryPayload }) =>
      catalogService.updateSubCategory(id, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteSubCategory = useMutation({
    mutationFn: (id: number) => catalogService.deleteSubCategory(id),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  const createSubSubCategory = useMutation({
    mutationFn: (payload: CreateSubSubCategoryPayload) =>
      catalogService.createSubSubCategory(payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateSubSubCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSubSubCategoryPayload }) =>
      catalogService.updateSubSubCategory(id, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteSubSubCategory = useMutation({
    mutationFn: (id: number) => catalogService.deleteSubSubCategory(id),
    onSuccess: () => {
      invalidateAll();
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    createSubSubCategory,
    updateSubSubCategory,
    deleteSubSubCategory,
  };
}
