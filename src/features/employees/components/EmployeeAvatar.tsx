'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import { apiClient } from '@/services/api';
import { employeeProfilePhotoUrl } from '@/features/employees/utils/employee-photo.utils';
import { cn } from '@/lib/utils';

interface EmployeeAvatarProps {
  employeeId: number;
  name: string;
  hasProfilePhoto: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'size-9 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-base',
} as const;

export function EmployeeAvatar({
  employeeId,
  name,
  hasProfilePhoto,
  size = 'md',
  className,
}: EmployeeAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!hasProfilePhoto) {
      setSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(employeeProfilePhotoUrl(employeeId), {
          responseType: 'blob',
        });
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
  }, [employeeId, hasProfilePhoto]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border border-border bg-muted',
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
          {initials || <User className="size-4" aria-hidden />}
        </span>
      )}
    </div>
  );
}
