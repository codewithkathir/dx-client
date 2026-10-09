import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/money.utils';

export interface MoneyStripCell {
  label: string;
  value: number;
  /** "settled" = money received/paid (green), "balance" = what's left (blue). */
  tone?: 'settled' | 'balance';
}

/** The net / VAT / total / settled / balance strip used on bill and invoice details. */
export function MoneyStrip({ cells }: { cells: MoneyStripCell[] }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-border sm:grid-cols-5">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn(
            'border-border px-3.5 py-3 not-first:border-l max-sm:border-t max-sm:first:border-t-0',
            cell.tone === 'settled' && 'bg-[#f3fbf7]',
            cell.tone === 'balance' && 'bg-brand-blue-50',
          )}
        >
          <dt className="text-xs text-muted-foreground">{cell.label}</dt>
          <dd
            className={cn(
              'mt-0.5 text-[15px] font-semibold tabular-nums',
              cell.tone === 'settled' && 'text-status-success-ink',
              cell.tone === 'balance' && 'text-brand-blue-hover',
            )}
          >
            {formatMoney(cell.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
