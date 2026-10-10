'use client';

import { useAuthImage } from '@/hooks/useAuthImage';
import { cn } from '@/lib/utils';

function companyInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? words[0]?.[1] ?? '')).toUpperCase();
}

/** Photo endpoint keyed by the saved file, so a replaced picture isn't served from cache. */
export function partyPhotoUrl(endpoint: string, photo: string | null): string | null {
  return photo ? `${endpoint}?v=${encodeURIComponent(photo)}` : null;
}

interface PartyAvatarProps {
  name: string;
  /** Authenticated photo endpoint, or null to show the company initials. */
  photoUrl: string | null;
  className?: string;
}

/** Supplier / customer picture, falling back to the company initials. */
export function PartyAvatar({ name, photoUrl, className }: PartyAvatarProps) {
  const src = useAuthImage(photoUrl);

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-muted text-[13px] font-semibold text-[#33415a]',
        className,
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        companyInitials(name)
      )}
    </span>
  );
}
