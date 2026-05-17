'use client';

import { useEffect, useState } from 'react';

import { appConfig } from '@/config/app.config';

export function useDebounce<T>(value: T, delay = appConfig.debounceMs): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
