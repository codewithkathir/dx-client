export function formatExpenseAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function parseExpenseDate(date: string): Date {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00`);
  }
  return new Date(trimmed);
}

export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Display as "07 Oct 2026" (design system date format). */
export function formatExpenseDate(date: string): string {
  const parsed = parseExpenseDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${day} ${SHORT_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

export function getTodayExpenseDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function supportFileLabel(path: string | null): string | null {
  if (!path) return null;
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function isImageSupportFile(path: string | null): boolean {
  if (!path) return false;
  const name = supportFileLabel(path)?.toLowerCase() ?? '';
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  return IMAGE_EXTENSIONS.has(name.slice(dot));
}
