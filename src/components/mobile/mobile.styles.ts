/** Design "msh-btn": full-width 52px thumb buttons used across the employee app. */
export const MOBILE_BUTTON = {
  base: 'flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60',
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  danger: 'bg-destructive text-white hover:bg-destructive-hover',
  plain: 'bg-muted text-foreground hover:bg-[#e2e8f0]',
} as const;

export function mobileButton(variant: 'primary' | 'danger' | 'plain' = 'primary'): string {
  return `${MOBILE_BUTTON.base} ${MOBILE_BUTTON[variant]}`;
}

/** Larger touch inputs for sheets and mobile forms. */
export const MOBILE_INPUT = 'h-12 rounded-xl text-base';
