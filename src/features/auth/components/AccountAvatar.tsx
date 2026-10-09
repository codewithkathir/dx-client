'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface AccountAvatarProps {
  name: string;
  photoFetchUrl: string | null;
  hasProfilePhoto: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'size-9 text-[13px]',
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
  const [photo, setPhoto] = useState<{ fetchUrl: string; src: string | null } | null>(null);
  const activeFetchUrl = hasProfilePhoto ? photoFetchUrl : null;
  const src = activeFetchUrl && photo?.fetchUrl === activeFetchUrl ? photo.src : null;

  useEffect(() => {
    if (!activeFetchUrl) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(activeFetchUrl, { responseType: 'blob' });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setPhoto({ fetchUrl: activeFetchUrl, src: objectUrl });
      } catch {
        if (!cancelled) setPhoto({ fetchUrl: activeFetchUrl, src: null });
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setPhoto(null);
      }
    };
  }, [activeFetchUrl]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted text-muted-foreground shadow-sm',
        SIZE_CLASSES[size],
        className,
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center font-semibold">
          {initials || <User className="size-[45%]" aria-hidden />}
        </span>
      )}
    </div>
  );
}
