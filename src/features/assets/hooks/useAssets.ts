'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { assetService } from '@/features/assets/services/asset.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import type { AssetListFilters, AssetPayload, AssignAssetPayload, ReturnAssetPayload } from '@/types/asset.types';

export function useAssets(filters: AssetListFilters) {
  return useQuery({
    queryKey: queryKeys.assets.list(filters),
    queryFn: () => assetService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAssetSummary() {
  return useQuery({ queryKey: queryKeys.assets.summary, queryFn: () => assetService.summary() });
}

export function useAsset(id: number | null) {
  return useQuery({
    queryKey: queryKeys.assets.detail(id ?? 0),
    queryFn: () => assetService.getById(id!),
    enabled: id !== null && id > 0,
  });
}

export function useAssetMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });

  const createAsset = useMutation({
    mutationFn: (payload: AssetPayload) => assetService.create(payload),
    onSuccess: (asset) => {
      invalidate();
      toast.success(`Asset ${asset.assetNo} added`);
    },
    onError: (err) => handleError(err),
  });

  const updateAsset = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AssetPayload> }) => assetService.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Asset updated');
    },
    onError: (err) => handleError(err),
  });

  const deleteAsset = useMutation({
    mutationFn: (id: number) => assetService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Asset deleted');
    },
    onError: (err) => handleError(err),
  });

  const assignAsset = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssignAssetPayload }) => assetService.assign(id, payload),
    onSuccess: (asset) => {
      invalidate();
      toast.success(`${asset.name} assigned to ${asset.currentAssignment?.employeeName ?? 'employee'}`);
    },
    onError: (err) => handleError(err),
  });

  const returnAsset = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReturnAssetPayload }) => assetService.returnAsset(id, payload),
    onSuccess: (asset) => {
      invalidate();
      toast.success(`Return of ${asset.name} recorded`);
    },
    onError: (err) => handleError(err),
  });

  return { createAsset, updateAsset, deleteAsset, assignAsset, returnAsset };
}

/** Employee app */
export function useMyAssets() {
  return useQuery({ queryKey: queryKeys.assets.mine, queryFn: () => assetService.mine() });
}

export function useAcknowledgeAsset() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  return useMutation({
    mutationFn: (assignmentId: number) => assetService.acknowledge(assignmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.mine });
      toast.success('Thanks — receipt confirmed');
    },
    onError: (err) => handleError(err),
  });
}
