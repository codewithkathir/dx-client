'use client';

import { ImageOff } from 'lucide-react';

import { useFileBlob } from '@/components/shared/file-blob';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** A protected photo loaded with the auth header (plain <img src> can't send it). */
export function AssetThumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const { url, loading, failed } = useFileBlob(src);
  if (loading) return <Skeleton className={cn('rounded-[10px]', className)} />;
  if (failed || !url) {
    return (
      <span className={cn('flex items-center justify-center rounded-[10px] bg-muted text-muted-foreground', className)}>
        <ImageOff className="size-4" aria-hidden />
        <span className="sr-only">Photo unavailable</span>
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- object URL from an authenticated fetch
  return <img src={url} alt={alt} className={cn('rounded-[10px] object-cover', className)} />;
}
