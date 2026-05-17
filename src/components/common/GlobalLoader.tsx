'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { selectIsGlobalLoading } from '@/store/loading/loading.selectors';
import { useAppSelector } from '@/store/hooks';

const LOADER_FADE_MS = 200;

export function GlobalLoader() {
  const isLoading = useAppSelector(selectIsGlobalLoading);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), LOADER_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isLoading ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        {/* <Image
          src="/logo.png"
          alt="Application logo"
          width={160}
          height={160}
          priority
          className="h-auto w-[min(180px,40vw)] max-w-[180px] min-w-[120px] object-contain"
        /> */}
        <div className="flex flex-col items-center gap-3" aria-hidden={!isLoading}>
          <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm font-medium tracking-wide text-white/90">Loading...</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
