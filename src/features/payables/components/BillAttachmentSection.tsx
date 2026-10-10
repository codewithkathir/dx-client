'use client';

import { useRef, useState } from 'react';
import { FileUp, Paperclip, RefreshCw, Trash } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilePreview } from '@/components/shared/FilePreview';
import { friendlyFileName } from '@/components/shared/file-blob';
import { Button } from '@/components/ui/button';
import { ACCEPTED_SUPPORT_FILE_TYPES } from '@/features/expenses/constants/expense.constants';
import { usePayableMutations } from '@/features/payables/hooks/usePayables';
import { cn } from '@/lib/utils';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { BillDetail } from '@/types/finance.types';

/** Matches the server's MAX_FILE_SIZE default. */
const MAX_FILE_MB = 5;
const ACCEPTED_EXTENSIONS = new Set(ACCEPTED_SUPPORT_FILE_TYPES.split(','));
const LABEL = 'Bill document';

function validateFile(file: File): string | null {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!ACCEPTED_EXTENSIONS.has(ext)) return VALIDATION_MESSAGES.FILE_TYPE(LABEL);
  if (file.size > MAX_FILE_MB * 1024 * 1024) return VALIDATION_MESSAGES.FILE_TOO_LARGE(LABEL, MAX_FILE_MB);
  return null;
}

interface BillAttachmentSectionProps {
  bill: BillDetail;
}

/** The supplier's bill (scan/PDF) for manual bills, or the claim receipt for reimbursements. */
export function BillAttachmentSection({ bill }: BillAttachmentSectionProps) {
  const { uploadAttachment, removeAttachment } = usePayableMutations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const canManage = bill.source === 'manual';
  const attachment = bill.attachment;
  const uploading = uploadAttachment.isPending;

  const upload = (file: File | undefined) => {
    if (!file) return;
    const problem = validateFile(file);
    setError(problem);
    if (problem) return;
    uploadAttachment.mutate({ id: bill.id, file });
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      className="sr-only"
      accept={ACCEPTED_SUPPORT_FILE_TYPES}
      aria-label={LABEL}
      onChange={(e) => {
        upload(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  return (
    <section aria-labelledby="bill-document" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 id="bill-document" className="text-sm font-semibold">
          Document
        </h3>
        {attachment?.source === 'expense' ? (
          <span className="text-xs text-muted-foreground">Receipt from expense claim #{bill.expenseId}</span>
        ) : null}
      </div>

      {attachment ? (
        <FilePreview
          key={`${bill.id}-${bill.updatedAt}`}
          src={API_ENDPOINTS.PAYABLES.ATTACHMENT(bill.id)}
          fileName={friendlyFileName(attachment.fileName, attachment.source === 'expense' ? `${bill.billNo}-receipt` : bill.billNo)}
          contentType={attachment.contentType}
          className="h-[min(50vh,380px)]"
          actions={
            canManage && attachment.source === 'bill' ? (
              <>
                {picker}
                <Button variant="outline" size="sm" disabled={uploading} loading={uploading} onClick={() => inputRef.current?.click()}>
                  {uploading ? null : <RefreshCw className="size-4" />}
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={removeAttachment.isPending}
                  onClick={() => setConfirmRemove(true)}
                >
                  <Trash className="size-4" />
                  Remove
                </Button>
              </>
            ) : null
          }
        />
      ) : canManage ? (
        <>
          {picker}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
              dragging ? 'border-primary bg-brand-blue-50' : 'border-border hover:bg-muted/50',
              error && 'border-destructive',
            )}
          >
            <FileUp className="size-7 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Attach the supplier’s bill'}</span>
            <span className="text-xs text-muted-foreground">Drop a file here or click to browse · JPG, PNG, WebP, PDF, Word · up to {MAX_FILE_MB} MB</span>
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <Paperclip className="size-4" aria-hidden />
          No receipt was attached to the expense claim.
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remove document"
        description={`Remove ${attachment?.fileName ?? 'this document'} from bill ${bill.billNo}?`}
        confirmText="Remove"
        variant="destructive"
        loading={removeAttachment.isPending}
        onConfirm={() => removeAttachment.mutate(bill.id, { onSuccess: () => setConfirmRemove(false) })}
        onCancel={() => setConfirmRemove(false)}
      />
    </section>
  );
}
