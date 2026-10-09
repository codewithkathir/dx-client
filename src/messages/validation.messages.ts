export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required.',
  EMAIL: 'Please enter a valid email address.',
  PASSWORD_MIN: 'Password must be at least 8 characters.',
  PASSWORD_MATCH: 'Passwords do not match.',
  DATE: 'Please enter a valid date.',
  AMOUNT: 'Enter an amount greater than zero.',
  MONEY_DECIMALS: 'Use at most 2 decimal places.',
  TRN: 'TRN must be 15 digits.',
  INVOICE_DUE_DATE_ORDER: "Due date can't be before the invoice date.",
  DUE_DATE_ORDER: "Due date can't be before the bill date.",
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters.`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters.`,
} as const;
