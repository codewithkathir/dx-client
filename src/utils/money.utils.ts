/** Money helpers mirroring the server: arithmetic in integer fils (AED × 100). */

export function toFils(amount: number): number {
  return Math.round(amount * 100);
}

export function fromFils(fils: number): number {
  return fils / 100;
}

/** VAT rounded half-up to the nearest fils, exactly as the server computes it. */
export function calculateTotals(subtotal: number, vatRatePercent: number) {
  const subtotalFils = toFils(subtotal);
  const vatFils = Math.round((subtotalFils * vatRatePercent) / 100);
  return {
    subtotal: fromFils(subtotalFils),
    vat: fromFils(vatFils),
    total: fromFils(subtotalFils + vatFils),
  };
}

export function formatMoney(amount: number, currency = 'AED'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Today as YYYY-MM-DD in the browser's timezone (input[type=date] format). */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Add days to a YYYY-MM-DD date (calendar arithmetic, timezone-safe). */
export function addDaysIso(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}
