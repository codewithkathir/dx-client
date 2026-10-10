'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/services/api';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

export type FileKind = 'image' | 'pdf' | 'other';

export function kindOf(fileName: string, contentType?: string | null): FileKind {
  const type = contentType?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Loads a protected file through the API client and keeps an object URL for it. */
export function useFileBlob(src: string, contentType?: string | null) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${src}|${contentType ?? ''}|${attempt}`;
  // Result is tagged with the request it belongs to, so a new src reads as "loading" without a reset.
  const [result, setResult] = useState<{ key: string; url: string | null; size: number; failed: boolean } | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    apiClient
      .get<Blob>(src, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        const blob = response.data;
        const type = contentType || blob.type || String(response.headers['content-type'] ?? '');
        // Re-wrap so the browser gets the right type (PDF viewer, image decode).
        const typed = type && blob.type !== type ? new Blob([blob], { type }) : blob;
        objectUrl = URL.createObjectURL(typed);
        setResult({ key: requestKey, url: objectUrl, size: typed.size, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, url: null, size: 0, failed: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, contentType, requestKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = result?.key === requestKey ? result : null;
  return {
    url: current?.url ?? null,
    size: current?.size ?? 0,
    loading: current === null,
    failed: current?.failed ?? false,
    retry,
  };
}

/** "bill_1791…_x7k2.png" + "BILL-0042" → "BILL-0042.png": a readable name for titles and downloads. */
export function friendlyFileName(storedName: string, baseName: string): string {
  const ext = storedName.includes('.') ? storedName.slice(storedName.lastIndexOf('.')) : '';
  return `${baseName.replace(/[^\w.-]+/g, '-')}${ext.toLowerCase()}`;
}
