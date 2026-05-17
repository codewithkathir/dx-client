'use client';

import { useCallback, useState } from 'react';

import { TABLE_CONSTANTS } from '@/constants/table.constants';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [pageSize, setPageSize] = useState(
    options.initialPageSize ?? TABLE_CONSTANTS.DEFAULT_PAGE_SIZE,
  );

  const reset = useCallback(() => {
    setPage(1);
    setPageSize(TABLE_CONSTANTS.DEFAULT_PAGE_SIZE);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset,
    params: { page, limit: pageSize },
  };
}
