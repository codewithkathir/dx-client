'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

import { GlobalLoader } from '@/components/common/GlobalLoader';
import {
  decrementSuspenseLoading,
  incrementSuspenseLoading,
  setRouteLoading,
} from '@/store/loading/loading.slice';
import { useAppDispatch } from '@/store/hooks';

const ROUTE_LOADER_MIN_MS = 150;

interface LoadingProviderProps {
  children: React.ReactNode;
}

function SuspenseLoadingTrigger() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(incrementSuspenseLoading());
    return () => {
      dispatch(decrementSuspenseLoading());
    };
  }, [dispatch]);

  return null;
}

function RouteLoadingListener() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    dispatch(setRouteLoading(true));
    const startedAt = Date.now();

    const finish = () => {
      const elapsed = Date.now() - startedAt;
      const delay = Math.max(0, ROUTE_LOADER_MIN_MS - elapsed);
      window.setTimeout(() => dispatch(setRouteLoading(false)), delay);
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(finish);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      dispatch(setRouteLoading(false));
    };
  }, [dispatch, pathname]);

  return null;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  return (
    <Suspense fallback={<SuspenseLoadingTrigger />}>
      <RouteLoadingListener />
      {children}
      <GlobalLoader />
    </Suspense>
  );
}
