/**
 * Shrinks a photo in the browser before upload so it fits under the server's limit.
 * Phone cameras produce 2–12 MB photos; after this they are typically 200 KB–1 MB.
 * Non-images (PDF, Word) and images that can't be decoded are returned unchanged,
 * and the caller's size check still applies.
 */

const COMPRESSIBLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const COMPRESSIBLE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

export interface CompressOptions {
  /** Hard limit the result must fit under (the upload's max size). */
  maxBytes: number;
  /** Longest side in pixels. 2000 px keeps receipts and serial labels readable. */
  maxDimension?: number;
  /** Files already under this size and dimension are uploaded as they are. */
  keepIfUnderBytes?: number;
}

export function isCompressibleImage(file: File): boolean {
  return COMPRESSIBLE.has(file.type.toLowerCase()) || (file.type === '' && COMPRESSIBLE_EXT.test(file.name));
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      // Applies the EXIF rotation, so portrait phone photos stay upright.
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fall through to <img> (older Safari, some HEIC files).
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(source: CanvasImageSource, width: number, height: number, quality: number): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  // JPEG has no transparency: paint white first so transparent PNGs don't turn black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

const jpegName = (name: string) => `${name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`;

export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  const { maxBytes, maxDimension = 2000, keepIfUnderBytes = 1024 * 1024 } = options;
  if (!isCompressibleImage(file)) return file;

  let image: ImageBitmap | HTMLImageElement;
  try {
    image = await decode(file);
  } catch {
    return file;
  }

  const srcWidth = 'naturalWidth' in image ? image.naturalWidth : image.width;
  const srcHeight = 'naturalHeight' in image ? image.naturalHeight : image.height;
  const fitsAlready =
    file.size <= Math.min(keepIfUnderBytes, maxBytes) && Math.max(srcWidth, srcHeight) <= maxDimension && file.type !== 'image/heic' && file.type !== 'image/heif';

  try {
    if (fitsAlready || !srcWidth || !srcHeight) return file;

    let scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
    let best: Blob | null = null;
    // Lower the quality first, then the size, until it fits.
    for (let round = 0; round < 6; round++) {
      const width = Math.max(1, Math.round(srcWidth * scale));
      const height = Math.max(1, Math.round(srcHeight * scale));
      for (const quality of [0.85, 0.75, 0.65]) {
        const blob = await encode(image, width, height, quality);
        if (!blob) return file;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= maxBytes) {
          return new File([blob], jpegName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
        }
      }
      scale *= 0.75;
    }
    // Couldn't get under the limit (very unusual): send the smallest version; the size check reports it.
    return best && best.size < file.size
      ? new File([best], jpegName(file.name), { type: 'image/jpeg', lastModified: Date.now() })
      : file;
  } finally {
    if ('close' in image) image.close();
  }
}
