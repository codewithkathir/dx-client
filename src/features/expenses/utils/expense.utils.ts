export function formatExpenseAmount(amount: number): string {
  return new Intl.NumberFormat(undefined, {
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

/** Display as DD/MM/YYYY (e.g. 17/05/2026) */
export function formatExpenseDate(date: string): string {
  const parsed = parseExpenseDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
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
