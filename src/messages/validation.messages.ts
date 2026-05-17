export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required.',
  EMAIL: 'Please enter a valid email address.',
  PASSWORD_MIN: 'Password must be at least 8 characters.',
  PASSWORD_MATCH: 'Passwords do not match.',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters.`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters.`,
} as const;
