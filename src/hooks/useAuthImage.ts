'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/services/api';

/**
 * Loads an image from an authenticated API endpoint (an <img src> can't send the
 * bearer token) and returns an object URL for it, or null while loading / on error.
 */
export function useAuthImage(url: string | null): string | null {
  const [loaded, setLoaded] = useState<{ url: string; src: string | null } | null>(null);

  useEffect(() => {
    if (!url) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(url, { responseType: 'blob' });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setLoaded({ url, src: objectUrl });
      } catch {
        if (!cancelled) setLoaded({ url, src: null });
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return url && loaded?.url === url ? loaded.src : null;
}
