'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { Camera, FolderOpen } from 'lucide-react';

import { CameraCaptureDialog } from '@/components/shared/CameraCaptureDialog';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image-compress';
import { cn } from '@/lib/utils';

/** Phones/tablets (touch-first) get the native camera; desktops get the webcam dialog. */
function subscribe(callback: () => void) {
  const query = window.matchMedia('(pointer: coarse)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

interface FileSourcePickerProps {
  /** `accept` for the Device picker, e.g. ".jpg,.png,.pdf" or "image/*". */
  accept: string;
  onPick: (file: File) => void;
  /** Back camera for documents and items; front camera for profile photos. */
  facing?: 'environment' | 'user';
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  cameraLabel?: string;
  deviceLabel?: string;
  /** Title of the desktop webcam dialog. */
  cameraTitle?: string;
  className?: string;
  buttonClassName?: string;
  /** For aria-describedby on the buttons (e.g. an inline error). */
  describedBy?: string;
  /** When set, photos are resized/compressed in the browser to fit under this size before `onPick`. */
  maxBytes?: number;
  /** Longest side after compression (default 2000 px). */
  maxDimension?: number;
}

/**
 * Two ways to add a picture: "Camera" (take one now) and "Device" (choose an existing file).
 * The caller validates the file (type / max size) and shows any error inline.
 */
export function FileSourcePicker({
  accept,
  onPick,
  facing = 'environment',
  disabled,
  size = 'default',
  cameraLabel = 'Camera',
  deviceLabel = 'Device',
  cameraTitle,
  className,
  buttonClassName,
  describedBy,
  maxBytes,
  maxDimension,
}: FileSourcePickerProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const deviceInput = useRef<HTMLInputElement>(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const touch = useSyncExternalStore(subscribe, isTouchDevice, () => false);

  const deliver = async (file: File) => {
    if (!maxBytes) {
      onPick(file);
      return;
    }
    setPreparing(true);
    try {
      onPick(await compressImage(file, { maxBytes, maxDimension }));
    } finally {
      setPreparing(false);
    }
  };

  const handle = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = '';
    if (file) void deliver(file);
  };
  const busy = disabled || preparing;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={buttonClassName}
        disabled={busy}
        aria-describedby={describedBy}
        onClick={() => (touch ? cameraInput.current?.click() : setWebcamOpen(true))}
      >
        <Camera className="size-4" />
        {preparing ? 'Preparing photo…' : cameraLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={buttonClassName}
        disabled={busy}
        aria-describedby={describedBy}
        onClick={() => deviceInput.current?.click()}
      >
        <FolderOpen className="size-4" />
        {deviceLabel}
      </Button>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture={facing}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handle(e.currentTarget)}
      />
      <input
        ref={deviceInput}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handle(e.currentTarget)}
      />
      <CameraCaptureDialog
        open={webcamOpen}
        facing={facing}
        title={cameraTitle}
        onClose={() => setWebcamOpen(false)}
        onCapture={(file) => void deliver(file)}
      />
    </div>
  );
}
