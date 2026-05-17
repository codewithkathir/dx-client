import type { AxiosError } from 'axios';

import { ERROR_MESSAGES } from '@/messages/error.messages';
import type { ApiFieldError, NormalizedApiError } from '@/types/api.types';

interface ApiErrorBody {
  message?: string;
  errors?: ApiFieldError[];
  timestamp?: string;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status ?? 0;
    const body = error.response?.data as ApiErrorBody | undefined;

    return {
      statusCode,
      message: body?.message ?? getDefaultMessage(statusCode),
      errors: body?.errors ?? [],
      timestamp: body?.timestamp,
    };
  }

  return {
    statusCode: 0,
    message: ERROR_MESSAGES.GENERIC,
    errors: [],
  };
}

function isAxiosError(error: unknown): error is AxiosError<ApiErrorBody> {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

function getDefaultMessage(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return ERROR_MESSAGES.VALIDATION;
    case 429:
      return ERROR_MESSAGES.RATE_LIMIT;
    case 503:
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    case 500:
      return ERROR_MESSAGES.SERVER;
    default:
      if (statusCode === 0) {
        return ERROR_MESSAGES.NETWORK;
      }
      return ERROR_MESSAGES.GENERIC;
  }
}
