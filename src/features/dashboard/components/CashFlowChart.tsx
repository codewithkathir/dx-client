'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { CashFlowMonth } from '@/types/dashboard.types';
import { formatMoney } from '@/utils/money.utils';

const PLOT_HEIGHT = 196;

const SERIES = [
  { key: 'moneyIn', label: 'Money in', color: 'var(--chart-2)' },
  { key: 'moneyOut', label: 'Money out', color: 'var(--chart-1)' },
] as const;

const monthLabel = (month: string, style: 'short' | 'long' = 'short') =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: style, ...(style === 'long' ? { year: 'numeric' } : {}) });

/** Rounds the axis maximum up to a 1/2/2.5/5 × 10ⁿ step so gridlines land on round numbers. */
function niceMax(value: number): number {
  if (value <= 0) return 4;
  const step = value / 4;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= step) ?? 10;
  return nice * magnitude * 4;
}

const compact = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/** Grouped bars: money in vs money out per month (one axis, two fixed colours). */
export function CashFlowChart({ months }: { months: CashFlowMonth[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = niceMax(Math.max(...months.flatMap((m) => [m.moneyIn, m.moneyOut]), 0));
  const ticks = [4, 3, 2, 1, 0].map((i) => (max / 4) * i);
  const lastIndex = months.length - 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex gap-4 text-[13px] text-muted-foreground" aria-label="Legend">
          {SERIES.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-[13px] font-medium text-primary hover:underline"
          aria-pressed={showTable}
        >
          {showTable ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {showTable ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="py-2">Month</th>
              <th className="py-2 text-right">Money in</th>
              <th className="py-2 text-right">Money out</th>
              <th className="py-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-border last:border-0">
                <td className="py-2">{monthLabel(m.month, 'long')}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(m.moneyIn)}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(m.moneyOut)}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(m.moneyIn - m.moneyOut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-2" role="img" aria-label="Money in and out by month; use View as table for the figures">
          <div className="flex h-[220px] flex-col justify-between pb-6 text-right text-xs text-muted-foreground tabular-nums">
            {ticks.map((t) => (
              <span key={t}>{compact(t)}</span>
            ))}
          </div>
          <div className="relative grid h-[220px] gap-3" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
            {/* Recessive gridlines */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[196px]" aria-hidden>
              {ticks.map((t, i) => (
                <div key={t} className="absolute inset-x-0 border-t border-muted" style={{ top: `${(i / 4) * 100}%` }} />
              ))}
            </div>
            {months.map((m, i) => (
              <div
                key={m.month}
                className="relative flex flex-col items-center justify-end gap-1.5"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className={cn('flex items-end gap-0.5 rounded-t-md px-1 transition-colors', hover === i && 'bg-muted/70')} style={{ height: PLOT_HEIGHT }}>
                  {SERIES.map((s) => (
                    <div
                      key={s.key}
                      className="w-4 rounded-t-[4px]"
                      style={{ height: `${(m[s.key] / max) * PLOT_HEIGHT}px`, background: s.color, minHeight: m[s.key] > 0 ? 2 : 0 }}
                    />
                  ))}
                </div>
                <span className={cn('text-xs', i === lastIndex ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                  {monthLabel(m.month)}
                </span>
                {hover === i ? (
                  <div className="pointer-events-none absolute bottom-[calc(100%-8px)] z-10 w-max min-w-40 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-semibold">{monthLabel(m.month, 'long')}</p>
                    {SERIES.map((s) => (
                      <p key={s.key} className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <span className="size-2 rounded-[2px]" style={{ background: s.color }} aria-hidden />
                          {s.label}
                        </span>
                        <span className="font-medium tabular-nums">{formatMoney(m[s.key])}</span>
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
