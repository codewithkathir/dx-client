'use client';

import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RotateCw,
} from 'lucide-react';

import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { formatSize, kindOf, useFileBlob, type FileKind } from '@/components/shared/file-blob';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
export interface FilePreviewProps {
  /** API path (relative to the Axios base URL) that streams the file. */
  src: string;
  fileName: string;
  contentType?: string | null;
  variant?: 'detail' | 'thumbnail';
  /** Height of the detail viewer. */
  className?: string;
  /** Extra buttons shown in the footer (e.g. Replace / Remove). */
  actions?: ReactNode;
}

interface ToolButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({ label, disabled, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-8 items-center justify-center rounded-md text-foreground transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      {children}
    </button>
  );
}

interface ViewerProps {
  url: string;
  kind: FileKind;
  fileName: string;
  fullscreen?: boolean;
}

/** Zoomable / rotatable image, or the browser's PDF viewer. */
function Viewer({ url, kind, fileName, fullscreen = false }: ViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((s + delta).toFixed(2)))));
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setRotation(0);
    viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, []);

  if (kind === 'pdf') {
    return (
      <iframe
        src={`${url}#toolbar=1&view=FitH`}
        title={fileName}
        className={cn('w-full rounded-lg border bg-muted/30', fullscreen ? 'h-full' : 'h-full min-h-[320px]')}
      />
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={viewportRef}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomBy(e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
          }
        }}
        onDoubleClick={reset}
        className="h-full overflow-auto rounded-lg border bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
      >
        <div
          className="flex items-center justify-center p-3"
          style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={fileName}
            draggable={false}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
          />
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/95 p-1 shadow-md backdrop-blur-sm">
        <ToolButton label="Zoom out" disabled={scale <= MIN_ZOOM} onClick={() => zoomBy(-ZOOM_STEP)}>
          <Minus className="size-4" />
        </ToolButton>
        <button
          type="button"
          onClick={reset}
          title="Reset zoom and rotation"
          className="min-w-11 rounded-md px-1 text-center text-xs font-medium tabular-nums text-muted-foreground hover:bg-muted"
        >
          {Math.round(scale * 100)}%
        </button>
        <ToolButton label="Zoom in" disabled={scale >= MAX_ZOOM} onClick={() => zoomBy(ZOOM_STEP)}>
          <Plus className="size-4" />
        </ToolButton>
        <ToolButton label="Rotate" onClick={() => setRotation((r) => (r + 90) % 360)}>
          <RotateCw className="size-4" />
        </ToolButton>
      </div>
    </div>
  );
}

/**
 * Preview for an uploaded file served by the API (auth header required, so it
 * is fetched as a blob). Images: zoom, rotate, full screen. PDFs: inline viewer.
 * Other types: a file card. Always offers open-in-new-tab and download.
 */
export function FilePreview({ src, fileName, contentType, variant = 'detail', className, actions }: FilePreviewProps) {
  const kind = kindOf(fileName, contentType);
  const { url, size, loading, failed, retry } = useFileBlob(src, contentType);
  const [fullscreen, setFullscreen] = useState(false);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  if (variant === 'thumbnail') {
    return (
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : url && kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={fileName} className="size-full object-cover" />
        ) : (
          <FileText className="size-4 text-muted-foreground" aria-label={fileName} />
        )}
      </div>
    );
  }

  const fileTools = url ? (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in new tab"
        title="Open in new tab"
        className="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
      >
        <ExternalLink className="size-4" />
      </a>
      <a
        href={url}
        download={fileName}
        aria-label="Download"
        title="Download"
        className="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
      >
        <Download className="size-4" />
      </a>
    </>
  ) : null;

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/40 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading preview…
      </div>
    );
  } else if (failed || !url) {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-4 text-center">
        <AlertCircle className="size-6 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">Couldn&apos;t load {fileName}.</p>
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  } else if (kind === 'other') {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 p-4 text-center">
        <FileText className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">No preview for this file type.</p>
        <a href={url} download={fileName} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Download className="size-4" />
          Download
        </a>
      </div>
    );
  } else {
    body = <Viewer url={url} kind={kind} fileName={fileName} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className={cn('h-[min(55vh,420px)]', className)}>{body}</div>

      <div className="flex min-w-0 items-center gap-2">
        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium" title={fileName}>
            {fileName}
          </p>
          {url ? (
            <p className="text-xs text-muted-foreground">
              {kind === 'pdf' ? 'PDF' : kind === 'image' ? 'Image' : 'File'} · {formatSize(size)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {url && kind !== 'other' ? (
            <ToolButton label="Full screen" onClick={() => setFullscreen(true)}>
              <Maximize2 className="size-4" />
            </ToolButton>
          ) : null}
          {fileTools}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}

      <AttachmentViewer
        open={fullscreen && Boolean(url)}
        onClose={closeFullscreen}
        url={url}
        size={size}
        fileName={fileName}
        contentType={contentType}
      />
    </div>
  );
}
