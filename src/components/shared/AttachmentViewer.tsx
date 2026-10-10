'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { CircleAlert, Download, FileText, Image as ImageIcon, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';

import { formatSize, kindOf, useFileBlob, type FileKind } from '@/components/shared/file-blob';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const STEP = 1.25;

interface AttachmentViewerProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  contentType?: string | null;
  /** API path that streams the file (fetched with the auth header). */
  src?: string;
  /** Already-loaded object URL (e.g. from FilePreview), to skip a second download. */
  url?: string | null;
  size?: number;
}

/** Design "ModalAttachment": a large viewer for receipts and bill documents. */
export function AttachmentViewer(props: AttachmentViewerProps) {
  if (!props.open) return null;
  return props.url ? (
    <ViewerDialog {...props} url={props.url} size={props.size ?? 0} loading={false} failed={false} />
  ) : (
    <FetchingViewer {...props} src={props.src ?? ''} />
  );
}

function FetchingViewer(props: AttachmentViewerProps & { src: string }) {
  const { url, size, loading, failed, retry } = useFileBlob(props.src, props.contentType);
  return <ViewerDialog {...props} url={url} size={size} loading={loading} failed={failed} onRetry={retry} />;
}

interface ViewerDialogProps extends AttachmentViewerProps {
  url: string | null;
  size: number;
  loading: boolean;
  failed: boolean;
  onRetry?: () => void;
}

function typeLabel(kind: FileKind, fileName: string, contentType?: string | null): string {
  if (kind === 'pdf') return 'PDF';
  const fromType = contentType?.split('/')[1];
  const ext = fromType ?? fileName.split('.').pop() ?? '';
  return ext.replace('jpeg', 'jpg').toUpperCase() || 'File';
}

function ViewerDialog({ onClose, fileName, contentType, url, size, loading, failed, onRetry }: ViewerDialogProps) {
  const kind = kindOf(fileName, contentType);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoomTo = useCallback((next: number) => setScale(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(3))))), []);
  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Wheel / trackpad pinch zooms the image (needs a non-passive listener to stop page scroll).
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || kind !== 'image') return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [kind, url]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (kind !== 'image') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOffset({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        Loading {fileName}…
      </div>
    );
  } else if (failed || !url) {
    body = (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleAlert className="size-7 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">Couldn&apos;t load {fileName}.</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  } else if (kind === 'pdf') {
    body = <iframe src={`${url}#toolbar=1&view=FitH`} title={fileName} className="size-full rounded-md border border-border bg-card" />;
  } else if (kind === 'image') {
    body = (
      // eslint-disable-next-line @next/next/no-img-element -- blob URL of a protected upload
      <img
        src={url}
        alt={fileName}
        draggable={false}
        onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        className="max-h-full max-w-full bg-card object-contain shadow-[0_4px_12px_-2px_rgba(15,28,46,.18)] transition-transform duration-75 select-none"
      />
    );
  } else {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center shadow-sm">
        <FileText className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">No preview for this file type.</p>
        <a href={url} download={fileName} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Download className="size-4" />
          Download
        </a>
      </div>
    );
  }

  const meta = [url ? formatSize(size) : null, typeLabel(kind, fileName, contentType), dims ? `${dims.w} × ${dims.h}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} closeOnOutsideClick>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attachment-title"
        className="relative z-10 flex h-[min(880px,92vh)] w-full max-w-[880px] animate-in flex-col overflow-hidden rounded-[20px] bg-card shadow-dialog fade-in-0 zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-2 border-b border-border py-3 pr-3 pl-5">
          {kind === 'image' ? (
            <ImageIcon className="size-[18px] shrink-0 text-primary" aria-hidden />
          ) : (
            <FileText className="size-[18px] shrink-0 text-primary" aria-hidden />
          )}
          <h2 id="attachment-title" className="min-w-0 flex-1 truncate text-[15px] font-semibold" title={fileName}>
            Attachment · {fileName}
          </h2>
          {kind === 'image' && url ? (
            <div role="toolbar" aria-label="Zoom" className="flex items-center gap-0.5 rounded-[10px] border border-border p-0.5">
              <Button variant="ghost" size="icon-sm" aria-label="Zoom out" disabled={scale <= MIN_ZOOM} onClick={() => zoomTo(scale / STEP)}>
                <ZoomOut className="size-4" />
              </Button>
              <button
                type="button"
                onClick={reset}
                title="Reset zoom"
                className="min-w-12 rounded-md text-center text-[13px] tabular-nums hover:bg-muted"
              >
                {Math.round(scale * 100)}%
              </button>
              <Button variant="ghost" size="icon-sm" aria-label="Zoom in" disabled={scale >= MAX_ZOOM} onClick={() => zoomTo(scale * STEP)}>
                <ZoomIn className="size-4" />
              </Button>
            </div>
          ) : null}
          {url ? (
            <a href={url} download={fileName} className={cn(buttonVariants({ variant: 'outline' }), 'h-8')}>
              <Download className="size-4" />
              Download
            </a>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={reset}
          className={cn(
            'flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted p-8',
            kind === 'image' && url && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
            kind === 'pdf' && 'p-3',
          )}
        >
          {body}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5 text-[13px] text-muted-foreground">
          <span>{meta}</span>
          <span className="max-sm:hidden">
            {kind === 'image' ? 'Scroll or pinch to zoom · drag to pan · double-click to reset' : kind === 'pdf' ? 'Use the PDF toolbar to zoom and page through' : ''}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
