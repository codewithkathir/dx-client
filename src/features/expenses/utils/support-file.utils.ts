import { formatSize } from '@/components/shared/file-blob';
import { ACCEPTED_SUPPORT_FILE_TYPES, MAX_SUPPORT_FILE_MB } from '@/features/expenses/constants/expense.constants';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const ACCEPTED_EXTENSIONS = new Set(ACCEPTED_SUPPORT_FILE_TYPES.split(','));

/** Checks a receipt / bill document before upload; returns the inline error, or null when it's fine. */
export function validateSupportFile(file: File, label: string): string | null {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!ACCEPTED_EXTENSIONS.has(ext)) return VALIDATION_MESSAGES.FILE_TYPE(label);
  if (file.size > MAX_SUPPORT_FILE_MB * 1024 * 1024) {
    return VALIDATION_MESSAGES.FILE_TOO_LARGE(label, MAX_SUPPORT_FILE_MB, formatSize(file.size));
  }
  return null;
}
