'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface AccountAvatarProps {
  name: string;
  photoFetchUrl: string | null;
  hasProfilePhoto: boolean;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  md: 'size-16 text-base',
  lg: 'size-24 text-lg',
  xl: 'size-32 text-xl',
} as const;

export function AccountAvatar({
  name,
  photoFetchUrl,
  hasProfilePhoto,
  size = 'lg',
  className,
}: AccountAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!hasProfilePhoto || !photoFetchUrl) {
      setSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(photoFetchUrl, { responseType: 'blob' });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [hasProfilePhoto, photoFetchUrl]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted shadow-sm',
        SIZE_CLASSES[size],
        className,
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center font-semibold text-muted-foreground">
          {initials || <User className="size-8" aria-hidden />}
        </span>
      )}
    </div>
  );
}
