'use client';

import { FilePreview } from '@/components/shared/FilePreview';
import { API_ENDPOINTS } from '@/services/endpoints';
import { supportFileLabel } from '@/features/expenses/utils/expense.utils';

interface ExpenseAttachmentPreviewProps {
  expenseId: number;
  supportFile: string;
  variant?: 'detail' | 'thumbnail';
  /** Override support-file API path (e.g. admin vs employee portal). */
  supportFileUrl?: (expenseId: number) => string;
  className?: string;
}

export function ExpenseAttachmentPreview({
  expenseId,
  supportFile,
  variant = 'detail',
  supportFileUrl,
  className,
}: ExpenseAttachmentPreviewProps) {
  const src = supportFileUrl?.(expenseId) ?? API_ENDPOINTS.EMPLOYEE_EXPENSES.SUPPORT_FILE(expenseId);

  return (
    <FilePreview
      src={src}
      fileName={supportFileLabel(supportFile) ?? 'Attachment'}
      variant={variant}
      className={className}
    />
  );
}
