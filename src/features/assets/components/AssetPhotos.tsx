'use client';

import { useId, useState } from 'react';
import { CircleAlert, ImagePlus, Trash } from 'lucide-react';

import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FileSourcePicker } from '@/components/shared/FileSourcePicker';
import { formatSize } from '@/components/shared/file-blob';
import { AssetThumb } from '@/features/assets/components/AssetThumb';
import {
  ASSET_IMAGE_ACCEPT,
  ASSET_IMAGE_MAX_COUNT,
  ASSET_IMAGE_MAX_MB,
} from '@/features/assets/constants/asset.constants';
import { cn } from '@/lib/utils';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';
import type { AssetImage } from '@/types/asset.types';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Checks a photo before upload; returns the inline error or null. */
export function validateAssetPhoto(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!IMAGE_TYPES.has(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return 'Photo must be a JPG, PNG or WebP image';
  }
  if (file.size > ASSET_IMAGE_MAX_MB * 1024 * 1024) {
    return VALIDATION_MESSAGES.FILE_TOO_LARGE('Photo', ASSET_IMAGE_MAX_MB, formatSize(file.size));
  }
  return null;
}

interface AssetPhotosProps {
  assetName: string;
  images: AssetImage[];
  /** API path for one photo. */
  srcFor: (imageId: number) => string;
  /** Admin only: add / delete. Omit for a read-only gallery (employee app). */
  onAdd?: (file: File) => void;
  onRemove?: (imageId: number) => void;
  adding?: boolean;
  removingId?: number | null;
  compact?: boolean;
}

export function AssetPhotos({ assetName, images, srcFor, onAdd, onRemove, adding, removingId, compact }: AssetPhotosProps) {
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AssetImage | null>(null);
  const [confirming, setConfirming] = useState<AssetImage | null>(null);
  const editable = Boolean(onAdd);
  const full = images.length >= ASSET_IMAGE_MAX_COUNT;

  const pick = (file: File) => {
    const problem = full
      ? `An asset can have up to ${ASSET_IMAGE_MAX_COUNT} photos. Delete one to add another.`
      : validateAssetPhoto(file);
    setError(problem);
    if (!problem) onAdd?.(file);
  };

  return (
    <section aria-label="Photos" className="flex flex-col gap-2.5">
      {editable ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] text-muted-foreground">
            {images.length}/{ASSET_IMAGE_MAX_COUNT} photos · JPG, PNG or WebP · up to {ASSET_IMAGE_MAX_MB} MB each
          </p>
          <FileSourcePicker
            accept={ASSET_IMAGE_ACCEPT}
            onPick={pick}
            size="sm"
            disabled={adding || full}
            cameraTitle={`Photo of ${assetName}`}
            maxBytes={ASSET_IMAGE_MAX_MB * 1024 * 1024}
            describedBy={error ? errorId : undefined}
          />
        </div>
      ) : null}

      {images.length === 0 && !adding ? (
        editable ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-input-border p-4 text-sm text-muted-foreground">
            <ImagePlus className="size-5 shrink-0" aria-hidden />
            No photos yet. Add the front, back and serial-number label so its condition is on record.
          </div>
        ) : null
      ) : (
        <ul className={cn('grid gap-2.5', compact ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-6')}>
          {images.map((image, index) => (
            <li key={image.id} className="group relative">
              <button
                type="button"
                onClick={() => setViewing(image)}
                className="block w-full overflow-hidden rounded-[10px] ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`View photo ${index + 1} of ${assetName}`}
              >
                <AssetThumb src={srcFor(image.id)} alt={`${assetName} photo ${index + 1}`} className="aspect-square w-full border border-border" />
              </button>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => setConfirming(image)}
                  disabled={removingId === image.id}
                  aria-label={`Delete photo ${index + 1}`}
                  className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-card/95 text-destructive shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <Trash className="size-3.5" />
                </button>
              ) : null}
            </li>
          ))}
          {adding ? (
            <li aria-live="polite" className="flex aspect-square items-center justify-center rounded-[10px] bg-muted shimmer text-xs text-muted-foreground">
              Uploading…
            </li>
          ) : null}
        </ul>
      )}

      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[13px] text-destructive">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <AttachmentViewer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        src={viewing ? srcFor(viewing.id) : undefined}
        fileName={viewing?.originalName ?? `${assetName}.jpg`}
        contentType={viewing?.mimeType}
      />
      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Delete photo"
        description="This photo will be removed from the asset."
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (confirming) onRemove?.(confirming.id);
          setConfirming(null);
        }}
        onCancel={() => setConfirming(null)}
      />
    </section>
  );
}
