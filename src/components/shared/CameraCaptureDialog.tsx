'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, SwitchCamera } from 'lucide-react';

import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  /** 'environment' = back camera, 'user' = selfie camera. */
  facing?: 'environment' | 'user';
  title?: string;
}

/** Desktop camera: live webcam preview → take photo → use it. Phones use the native camera instead. */
export function CameraCaptureDialog(props: CameraCaptureDialogProps) {
  if (!props.open) return null;
  return <CameraInner {...props} />;
}

function describeError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access was blocked. Allow the camera in your browser’s site settings, or choose a file from your device.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device. Choose a file instead.';
  if (name === 'NotReadableError') return 'The camera is being used by another app. Close it and try again.';
  return 'Couldn’t start the camera. Choose a file from your device instead.';
}

function CameraInner({ onClose, onCapture, facing = 'environment', title = 'Take a photo' }: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState(facing);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);
  const [cameraCount, setCameraCount] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability check
      setError('This browser can’t use the camera here. Choose a file from your device instead.');
      setStarting(false);
      return;
    }
    setStarting(true);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stop();
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (!cancelled) {
          setCameraCount(devices.filter((d) => d.kind === 'videoinput').length);
          setError(null);
        }
      })
      .catch((err) => !cancelled && setError(describeError(err)))
      .finally(() => !cancelled && setStarting(false));
    return () => {
      cancelled = true;
    };
  }, [facingMode, stop]);

  useEffect(() => stop, [stop]);
  useEffect(() => () => (shot ? URL.revokeObjectURL(shot.url) : undefined), [shot]);

  const take = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && setShot({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.88);
  };

  const use = () => {
    if (!shot) return;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    onCapture(new File([shot.blob], `photo-${stamp}.jpg`, { type: 'image/jpeg' }));
    stop();
    onClose();
  };

  const close = () => {
    stop();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent onClose={close} className="max-w-[720px]">
        <DialogIconHeader icon={Camera} title={title} description="Hold the item steady in good light, then take the photo." />
        <div className="px-6 py-5">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[#0f1c2e]">
            {error ? (
              <p role="alert" className="max-w-sm px-6 text-center text-sm text-white/90">
                {error}
              </p>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- local capture preview */}
            {shot ? <img src={shot.url} alt="Captured photo" className="absolute inset-0 size-full object-contain" /> : null}
            <video
              ref={videoRef}
              playsInline
              muted
              className={shot || error ? 'hidden' : 'size-full object-contain'}
              aria-label="Camera preview"
            />
            {starting && !error ? <span className="absolute text-sm text-white/80">Starting camera…</span> : null}
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          <div>
            {cameraCount > 1 && !shot && !error ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
              >
                <SwitchCamera className="size-4" />
                Switch camera
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="lg" onClick={close}>
              Cancel
            </Button>
            {shot ? (
              <>
                <Button type="button" variant="outline" size="lg" onClick={() => setShot(null)}>
                  <RefreshCw className="size-4" />
                  Retake
                </Button>
                <Button type="button" size="lg" onClick={use}>
                  Use photo
                </Button>
              </>
            ) : (
              <Button type="button" size="lg" onClick={take} disabled={Boolean(error) || starting}>
                <Camera className="size-4" />
                Take photo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
