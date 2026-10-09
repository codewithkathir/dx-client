'use client';

import { createPortal } from 'react-dom';

import { useIsClient } from '@/hooks/useIsClient';

/**
 * Renders children into document.body so fixed overlays (dialogs, sheets) cover the whole
 * viewport no matter which page element they are declared in. Renders nothing on the server.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  return isClient ? createPortal(children, document.body) : null;
}
