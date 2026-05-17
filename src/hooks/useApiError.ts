'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

import { setGlobalError } from '@/store/error/error.slice';
import { useAppDispatch } from '@/store/hooks';
import type { NormalizedApiError } from '@/types/api.types';
import { normalizeApiError } from '@/utils/errors/error.utils';

export function useApiError() {
  const dispatch = useAppDispatch();

  const handleError = useCallback(
    (error: unknown, options?: { toast?: boolean; global?: boolean }) => {
      const normalized: NormalizedApiError =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        'message' in error
          ? (error as NormalizedApiError)
          : normalizeApiError(error);

      if (options?.global === true) {
        dispatch(setGlobalError(normalized));
      }

      if (options?.toast !== false) {
        toast.error(normalized.message);
      }

      return normalized;
    },
    [dispatch],
  );

  return { handleError };
}
