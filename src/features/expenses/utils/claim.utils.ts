import type { Expense, ExpenseStage } from '@/types/expense.types';

/** Same rules as the server's stage filter: submitted → approved → paid, or rejected. */
export function claimStage(expense: Pick<Expense, 'employeeStatus' | 'adminStatus'>): ExpenseStage {
  if (expense.adminStatus === 'paid') return 'paid';
  if (expense.adminStatus === 'rejected' || expense.employeeStatus === 'rejected') return 'rejected';
  if (expense.employeeStatus === 'approved') return 'approved';
  return 'pending';
}

/** Employees can change a claim only until an administrator decides on it. */
export function isClaimEditable(expense: Pick<Expense, 'employeeStatus' | 'adminStatus'>): boolean {
  return claimStage(expense) === 'pending';
}

/** "Lunch with the client's team (4 people)." → "Lunch with the client's team" */
export function claimTitle(description: string | null, fallback: string): string {
  const firstLine = description?.split('\n')[0]?.trim();
  if (!firstLine) return fallback;
  const short = firstLine.replace(/\s*\(.*\)\.?$/, '').replace(/\.$/, '');
  return short.length > 48 ? `${short.slice(0, 47)}…` : short;
}

/** "2026-10-07" → "07 Oct" */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d));
}

/** "2026-10-07" → "October 2026" */
export function monthLabel(iso: string): string {
  const [y, m] = iso.split('-').map(Number) as [number, number];
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, 1));
}

/** Time-of-day greeting for the home header. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
