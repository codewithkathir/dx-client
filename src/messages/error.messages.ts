export const ERROR_MESSAGES = {
  LOGIN_INVALID: 'Invalid email or password',
  GENERIC: 'Something went wrong. Please try again later.',
  NETWORK: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'The request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please correct the errors and try again.',
  RATE_LIMIT: 'Too many requests. Please wait and try again.',
  SERVER: 'Server error. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
} as const;
