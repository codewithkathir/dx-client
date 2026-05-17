'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

interface ProfilePhotoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  /** Authenticated URL to load the current profile image preview */
  existingPhotoFetchUrl?: string | null;
  hasExistingPhoto?: boolean;
  required?: boolean;
  error?: string;
}

export function ProfilePhotoUpload({
  value,
  onChange,
  existingPhotoFetchUrl,
  hasExistingPhoto,
  required,
  error,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | undefined>();

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (!hasExistingPhoto || !existingPhotoFetchUrl) {
      setPreview(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(existingPhotoFetchUrl, {
          responseType: 'blob',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setPreview(objectUrl);
      } catch {
        if (!cancelled) setPreview(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [value, existingPhotoFetchUrl, hasExistingPhoto]);

  const handleFile = (file: File | null) => {
    setLocalError(undefined);
    if (!file) {
      onChange(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Use JPEG, PNG, or WebP');
      onChange(null);
      return;
    }

    if (file.size > MAX_BYTES) {
      setLocalError('Image must be 2 MB or smaller');
      onChange(null);
      return;
    }

    onChange(file);
  };

  return (
    <FormField
      label="Profile photo"
      htmlFor="profilePhoto"
      required={required}
      error={error ?? localError}
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors',
            'hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="Upload profile photo"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile preview" className="size-full object-cover" />
          ) : (
            <Camera className="size-8 text-muted-foreground" aria-hidden />
          )}
        </button>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Square photo recommended (4×4 ratio). Max 2 MB. JPEG, PNG, or WebP.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              {preview ? 'Change photo' : 'Upload photo'}
            </Button>
            {preview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                <X className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <input
          ref={inputRef}
          id="profilePhoto"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </FormField>
  );
}
