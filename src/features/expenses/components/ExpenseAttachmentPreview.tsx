'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FileText, Loader2, Minus, Plus } from 'lucide-react';

import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { cn } from '@/lib/utils';
import {
  isImageSupportFile,
  supportFileLabel,
} from '@/features/expenses/utils/expense.utils';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
interface ExpenseAttachmentPreviewProps {
  expenseId: number;
  supportFile: string;
  variant?: 'detail' | 'thumbnail';
  /** Override support-file API path (e.g. admin vs employee portal). */
  supportFileUrl?: (expenseId: number) => string;
}

interface ControlButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ControlButton({ label, disabled, onClick, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-8 items-center justify-center rounded-md border border-border/70 bg-background text-foreground shadow-sm',
        'transition-colors hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      {children}
    </button>
  );
}

export function ExpenseAttachmentPreview({
  expenseId,
  supportFile,
  variant = 'detail',
  supportFileUrl,
}: ExpenseAttachmentPreviewProps) {
  const fileEndpoint =
    supportFileUrl?.(expenseId) ??
    API_ENDPOINTS.EMPLOYEE_EXPENSES.SUPPORT_FILE(expenseId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(1);
  const [baseWidth, setBaseWidth] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const label = supportFileLabel(supportFile) ?? 'Attachment';
  const isImage = isImageSupportFile(supportFile);
  const enableZoom = variant === 'detail' && isImage;

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setFailed(false);
      setScale(1);
      setBaseWidth(null);
      try {
        const response = await apiClient.get<Blob>(fileEndpoint, {
          responseType: 'blob',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [expenseId, supportFile, fileEndpoint]);

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(MAX_ZOOM, Number((current + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(MIN_ZOOM, Number((current - ZOOM_STEP).toFixed(2))));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, []);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const containerWidth = viewportRef.current?.clientWidth ?? img.clientWidth;
    const fittedWidth = Math.min(img.naturalWidth, containerWidth - 24);
    setBaseWidth(fittedWidth > 0 ? fittedWidth : img.clientWidth);
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!enableZoom) return;
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setScale((current) => {
          const next = Number((current + delta).toFixed(2));
          return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
        });
      }
    },
    [enableZoom],
  );

  if (loading) {
    return (
      <div
        className={
          variant === 'thumbnail'
            ? 'flex size-10 items-center justify-center rounded-lg border border-border bg-muted'
            : 'flex h-40 items-center justify-center rounded-lg border bg-muted/50'
        }
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (failed || !previewUrl) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="size-4 shrink-0" />
        <span>{label}</span>
      </div>
    );
  }

  if (isImage) {
    if (variant === 'thumbnail') {
      return (
        <div className="relative size-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={label}
            className="size-10 rounded-lg border border-border object-cover"
          />
        </div>
      );
    }

    const displayWidth = baseWidth ? baseWidth * scale : undefined;

    return (
      <div className="space-y-2">
        <div className="relative rounded-lg">
          <div
            ref={viewportRef}
            onWheel={handleWheel}
            className={cn(
              'relative max-h-[min(50vh,360px)] overflow-auto rounded-lg border bg-muted/30',
              'touch-pan-x touch-pan-y',
            )}
          >
            <div className="flex min-h-[200px] min-w-full items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={label}
                draggable={false}
                onLoad={handleImageLoad}
                onDoubleClick={resetZoom}
                style={displayWidth ? { width: displayWidth, maxWidth: 'none' } : { maxWidth: '100%' }}
                className="h-auto select-none"
              />
            </div>
          </div>

          <div
            className={cn(
              'absolute top-3 right-3 z-20 flex items-center gap-1',
              'rounded-lg border border-border/60 bg-background/95 p-1.5 shadow-md backdrop-blur-sm',
            )}
          >
            <ControlButton
              label="Zoom out"
              disabled={scale <= MIN_ZOOM}
              onClick={zoomOut}
            >
              <Minus className="size-4" />
            </ControlButton>
            <span className="min-w-10 px-1 text-center text-xs font-medium tabular-nums text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <ControlButton label="Zoom in" disabled={scale >= MAX_ZOOM} onClick={zoomIn}>
              <Plus className="size-4" />
            </ControlButton>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {label} · use +/− to zoom · scroll to pan · double-click to reset
        </p>
      </div>
    );
  }

  return (
    <a
      href={previewUrl}
      download={label}
      className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
    >
      <FileText className="size-4" />
      {label}
    </a>
  );
}
