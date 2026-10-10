'use client';

import { useId, useState } from 'react';
import { CircleAlert, FileUp, Paperclip, Trash } from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilePreview } from '@/components/shared/FilePreview';
import { FileSourcePicker } from '@/components/shared/FileSourcePicker';
import { friendlyFileName } from '@/components/shared/file-blob';
import { Button } from '@/components/ui/button';
import { ACCEPTED_SUPPORT_FILE_TYPES, MAX_SUPPORT_FILE_MB } from '@/features/expenses/constants/expense.constants';
import { validateSupportFile } from '@/features/expenses/utils/support-file.utils';
import { usePayableMutations } from '@/features/payables/hooks/usePayables';
import { compressImage } from '@/lib/image-compress';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/services/endpoints';
import type { BillDetail } from '@/types/finance.types';

const LABEL = 'Bill document';
const MAX_BYTES = MAX_SUPPORT_FILE_MB * 1024 * 1024;

interface BillAttachmentSectionProps {
  bill: BillDetail;
}

/** The supplier's bill (scan/PDF) for manual bills, or the claim receipt for reimbursements. */
export function BillAttachmentSection({ bill }: BillAttachmentSectionProps) {
  const { uploadAttachment, removeAttachment } = usePayableMutations();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const canManage = bill.source === 'manual';
  const attachment = bill.attachment;
  const uploading = uploadAttachment.isPending;

  const upload = (file: File | undefined) => {
    if (!file) return;
    const problem = validateSupportFile(file, LABEL);
    setError(problem);
    if (problem) return;
    uploadAttachment.mutate({ id: bill.id, file });
  };

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
                <FileSourcePicker
                  accept={ACCEPTED_SUPPORT_FILE_TYPES}
                  onPick={upload}
                  size="sm"
                  disabled={uploading}
                  deviceLabel={uploading ? 'Uploading…' : 'Replace'}
                  cameraTitle={`Photo of bill ${bill.billNo}`}
                  maxBytes={MAX_BYTES}
                  describedBy={error ? errorId : undefined}
                />
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
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) void compressImage(dropped, { maxBytes: MAX_BYTES }).then(upload);
          }}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors',
            dragging ? 'border-primary bg-brand-blue-50' : 'border-border',
            error && 'border-destructive',
            uploading && 'opacity-60',
          )}
        >
          <FileUp className="size-7 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Attach the supplier’s bill'}</span>
          <span className="text-xs text-muted-foreground">
            Take a photo, choose a file or drop it here · JPG, PNG, WebP, PDF, Word · up to {MAX_SUPPORT_FILE_MB} MB
          </span>
          <FileSourcePicker
            accept={ACCEPTED_SUPPORT_FILE_TYPES}
            onPick={upload}
            size="sm"
            className="mt-1 justify-center"
            disabled={uploading}
            cameraTitle={`Photo of bill ${bill.billNo}`}
                  maxBytes={MAX_BYTES}
            describedBy={error ? errorId : undefined}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <Paperclip className="size-4" aria-hidden />
          No receipt was attached to the expense claim.
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[13px] text-destructive">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

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
