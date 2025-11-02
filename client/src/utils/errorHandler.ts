import toast from 'react-hot-toast';

export interface AppError {
  message: string;
  code?: string;
  context?: string;
  originalError?: unknown;
}

/**
 * Parse different types of errors into a standardized format
 */
export function parseError(error: unknown, context?: string): AppError {
  // Handle Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
      context,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      context,
      originalError: error,
    };
  }

  // Handle objects with error/message properties
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const message = (errObj.error || errObj.message || 'An unexpected error occurred') as string;
    return {
      message,
      code: errObj.code as string | undefined,
      context,
      originalError: error,
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
    context,
    originalError: error,
  };
}

/**
 * Log error to console with context
 */
export function logError(error: AppError): void {
  console.error(`[${error.context || 'Error'}]:`, error.message, error.originalError);
}

/**
 * Show error toast notification to user
 */
export function showErrorToast(message: string, duration?: number): void {
  toast.error(message, {
    duration: duration || 4000,
  });
}

/**
 * Show success toast notification to user
 */
export function showSuccessToast(message: string, duration?: number): void {
  toast.success(message, {
    duration: duration || 3000,
  });
}

/**
 * Show info toast notification to user
 */
export function showInfoToast(message: string, duration?: number): void {
  toast(message, {
    duration: duration || 3000,
    icon: 'ℹ️',
  });
}

/**
 * Main error handler - logs error and optionally shows toast
 */
export function handleError(
  error: unknown,
  context: string,
  options: {
    showToast?: boolean;
    toastMessage?: string;
    silent?: boolean;
  } = {}
): AppError {
  const { showToast = true, toastMessage, silent = false } = options;

  const appError = parseError(error, context);

  // Log error unless silent mode
  if (!silent) {
    logError(appError);
  }

  // Show toast notification if requested
  if (showToast) {
    showErrorToast(toastMessage || appError.message);
  }

  return appError;
}

/**
 * User-friendly error messages for common errors
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your internet connection and try again.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Get user-friendly error message based on HTTP status
 */
export function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return ERROR_MESSAGES.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN;
  }
}
