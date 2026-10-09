import { Check, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Includes a number', test: (v: string) => /\d/.test(v) },
  { label: 'Includes a symbol (recommended)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/** Design "ResetPassword": a 4-step strength meter and the rules, ticked as they are met. */
export function PasswordStrength({ value }: { value: string }) {
  const met = RULES.map((rule) => rule.test(value));
  const score = value ? met.filter(Boolean).length + (value.length >= 12 ? 1 : 0) : 0;

  return (
    <div className="mt-1 flex flex-col gap-2">
      <div aria-hidden className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn('h-1 rounded transition-colors duration-300', i < score ? 'bg-brand-green-600' : 'bg-border')}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1.5" aria-label="Password rules">
        {RULES.map((rule, i) => (
          <li
            key={rule.label}
            className={cn(
              'flex items-center gap-2 text-[13px] transition-colors',
              met[i] ? 'text-status-success-ink' : 'text-muted-foreground',
            )}
          >
            {met[i] ? <Check className="size-4 shrink-0" aria-hidden /> : <Circle className="size-4 shrink-0" aria-hidden />}
            {rule.label}
            <span className="sr-only">{met[i] ? '(met)' : '(not met yet)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
