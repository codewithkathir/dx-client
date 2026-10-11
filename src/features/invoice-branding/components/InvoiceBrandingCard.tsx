'use client';

import { useId, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileSignature, ImageIcon, Trash, Upload } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { FormField } from '@/components/forms/FormField';
import { formatSize } from '@/components/shared/file-blob';
import { partyPhotoUrl } from '@/components/shared/PartyAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoiceBranding, useInvoiceBrandingMutations } from '@/features/invoice-branding/hooks/useInvoiceBranding';
import { useAuthImage } from '@/hooks/useAuthImage';
import { optionalText } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { BrandingImageKind, InvoiceBranding } from '@/types/invoice-branding.types';

/** The server's PDF renderer embeds PNG and JPEG only. */
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];
const MAX_BYTES = 2 * 1024 * 1024;

const SLOTS: Array<{ kind: BrandingImageKind; title: string; hint: string }> = [
  { kind: 'logo', title: 'Company logo', hint: 'Top-left of every invoice. A wide, tightly cropped PNG works best.' },
  { kind: 'signature', title: 'Signature', hint: 'Above the signatory line. Use a PNG with a transparent background.' },
  { kind: 'stamp', title: 'Company stamp', hint: 'Beside the signature. A transparent PNG looks best.' },
];

const detailsSchema = z.object({
  signatoryName: optionalText('Signatory name', 150),
  signatoryTitle: optionalText('Signatory title', 150),
});
type DetailsValues = z.infer<typeof detailsSchema>;

function ImageSlot({ kind, title, hint, path }: { kind: BrandingImageKind; title: string; hint: string; path: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const { uploadImage, removeImage } = useInvoiceBrandingMutations();
  const src = useAuthImage(partyPhotoUrl(API_ENDPOINTS.INVOICE_BRANDING.IMAGE(kind), path));
  const busy = uploadImage.isPending || removeImage.isPending;

  const pick = (file: File | undefined) => {
    setError(undefined);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Use a PNG or JPEG image');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(VALIDATION_MESSAGES.FILE_TOO_LARGE(title, MAX_BYTES / (1024 * 1024), formatSize(file.size)));
      return;
    }
    uploadImage.mutate({ kind, file });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="max-h-full max-w-full object-contain" />
        ) : (
          <ImageIcon className="size-7 text-muted-foreground" aria-hidden />
        )}
      </div>
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <Button type="button" variant="outline" size="sm" loading={uploadImage.isPending} disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          {path ? 'Replace' : 'Upload'}
        </Button>
        {path ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => removeImage.mutate(kind)}>
            <Trash className="size-4" />
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SignatoryForm({ branding }: { branding: InvoiceBranding }) {
  const formId = useId();
  const { updateDetails } = useInvoiceBrandingMutations();
  const { register, handleSubmit, formState, reset } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    values: { signatoryName: branding.signatoryName ?? '', signatoryTitle: branding.signatoryTitle ?? '' },
  });
  const { errors } = formState;

  return (
    <form
      onSubmit={handleSubmit((v) =>
        updateDetails.mutate({ signatoryName: v.signatoryName || null, signatoryTitle: v.signatoryTitle || null }),
      )}
      className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
      noValidate
    >
      <FormField label="Signatory name" htmlFor={`${formId}-name`} error={errors.signatoryName?.message}>
        <Input id={`${formId}-name`} placeholder="e.g. Ahmed Al Mansoori" {...register('signatoryName')} />
      </FormField>
      <FormField label="Signatory title" htmlFor={`${formId}-title`} error={errors.signatoryTitle?.message}>
        <Input id={`${formId}-title`} placeholder="e.g. Finance Manager" {...register('signatoryTitle')} />
      </FormField>
      <div className="col-span-full flex justify-end gap-2">
        <Button type="button" variant="ghost" size="lg" onClick={() => reset()} disabled={updateDetails.isPending || !formState.isDirty}>
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={updateDetails.isPending} disabled={updateDetails.isPending || !formState.isDirty}>
          Save signatory
        </Button>
      </div>
    </form>
  );
}

/** Settings → Invoice branding: logo, signature, stamp and signatory printed on invoice PDFs. */
export function InvoiceBrandingCard() {
  const { data: branding, isLoading, isError, error, refetch } = useInvoiceBranding();

  return (
    <Card className="gap-0 py-0" aria-labelledby="settings-invoice-branding">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-brand-blue-50 text-primary" aria-hidden>
          <FileSignature className="size-5" />
        </span>
        <div>
          <h2 id="settings-invoice-branding" className="text-base font-semibold">
            Invoice branding
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Logo, signature and stamp printed on every invoice PDF. PNG or JPEG, up to 2 MB.
          </p>
        </div>
      </div>
      <div className="space-y-6 p-6">
        {isError ? (
          <ErrorPanel message={error?.message ?? 'Failed to load invoice branding'} onRetry={() => refetch()} />
        ) : isLoading || !branding ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {SLOTS.map((s) => (
              <Skeleton key={s.kind} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {SLOTS.map((slot) => (
                <ImageSlot key={slot.kind} {...slot} path={branding[slot.kind]} />
              ))}
            </div>
            <SignatoryForm branding={branding} />
          </>
        )}
      </div>
    </Card>
  );
}
