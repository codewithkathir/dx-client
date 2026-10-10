'use client';

import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { FileSourcePicker } from '@/components/shared/FileSourcePicker';
import { formatSize } from '@/components/shared/file-blob';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

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
  const [loaded, setLoaded] = useState<{ source: File | string; src: string | null } | null>(
    null,
  );
  const [localError, setLocalError] = useState<string | undefined>();

  // A newly selected file takes precedence over the existing photo.
  const existingUrl = hasExistingPhoto ? (existingPhotoFetchUrl ?? null) : null;
  const previewSource: File | string | null = value ?? existingUrl;
  const preview = previewSource && loaded?.source === previewSource ? loaded.src : null;

  useEffect(() => {
    if (value) {
      const reader = new FileReader();
      reader.onload = () => {
        setLoaded({
          source: value,
          src: typeof reader.result === 'string' ? reader.result : null,
        });
      };
      reader.readAsDataURL(value);
      return () => reader.abort();
    }

    if (!existingUrl) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiClient.get<Blob>(existingUrl, {
          responseType: 'blob',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setLoaded({ source: existingUrl, src: objectUrl });
      } catch {
        if (!cancelled) setLoaded({ source: existingUrl, src: null });
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setLoaded(null);
      }
    };
  }, [value, existingUrl]);

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
      setLocalError(VALIDATION_MESSAGES.FILE_TOO_LARGE('Photo', MAX_BYTES / (1024 * 1024), formatSize(file.size)));
      onChange(null);
      return;
    }

    onChange(file);
  };

  return (
    <FormField
      label="Profile photo"
      required={required}
      error={error ?? localError}
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div
          className={cn(
            'relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40',
            error ?? localError ? 'border-destructive' : 'border-border',
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile preview" className="size-full object-cover" />
          ) : (
            <Camera className="size-8 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Square photo recommended (4×4 ratio). Max 2 MB. JPEG, PNG, or WebP.
          </p>
          <div className="flex flex-wrap gap-2">
            <FileSourcePicker
              accept={ACCEPTED_TYPES.join(',')}
              onPick={handleFile}
              facing="user"
              size="sm"
              cameraTitle="Take a profile photo"
              maxBytes={MAX_BYTES}
              maxDimension={1024}
            />
            {/* Only a newly picked file can be removed; there is no API to delete a saved photo. */}
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFile(null)}
              >
                <X className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

      </div>
    </FormField>
  );
}
