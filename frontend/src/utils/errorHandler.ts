/**
 * Frontend Error Handling Utility
 *
 * Provides consistent error handling and user-friendly error messages
 * throughout the React application.
 *
 * Features:
 * - HTTP error mapping
 * - User-friendly error messages
 * - Error type classification
 * - Retry logic helpers
 * - Error logging
 */

export interface ApiError {
  status: number
  message: string
  context?: string
  originalError?: any
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorInfo {
  type: ErrorType
  title: string
  message: string
  canRetry: boolean
  userAction?: string
}

/**
 * Parse an error from an API response or network error
 */
export function parseError(error: any): ApiError {
  // Network error (no response)
  if (!error.response) {
    return {
      status: 0,
      message: error.message || 'Network error occurred',
      context: 'network',
      originalError: error,
    }
  }

  // API error response
  const response = error.response
  return {
    status: response.status,
    message: response.data?.message || response.statusText || 'An error occurred',
    context: response.data?.context,
    originalError: error,
  }
}

/**
 * Get user-friendly error information from API error
 */
export function getErrorInfo(error: ApiError): ErrorInfo {
  // Network errors
  if (error.status === 0) {
    return {
      type: ErrorType.NETWORK,
      title: 'Connection Error',
      message: 'Cannot connect to Gateway. Please check your network connection.',
      canRetry: true,
      userAction: 'Verify Gateway is running and try again',
    }
  }

  // Authentication errors
  if (error.status === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      title: 'Authentication Required',
      message: 'You need to log in to access this resource.',
      canRetry: false,
      userAction: 'Please log in to the Gateway web interface first',
    }
  }

  // Authorization errors
  if (error.status === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      canRetry: false,
      userAction: 'Contact your administrator to request Designer permissions',
    }
  }

  // Not found errors
  if (error.status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      title: 'Resource Not Found',
      message: error.message || 'The requested resource could not be found.',
      canRetry: false,
      userAction: 'Verify the resource exists and try again',
    }
  }

  // Validation errors
  if (error.status === 400) {
    return {
      type: ErrorType.VALIDATION,
      title: 'Invalid Request',
      message: error.message || 'The request contains invalid data.',
      canRetry: false,
      userAction: 'Check your input and try again',
    }
  }

  // Conflict errors (optimistic concurrency)
  if (error.status === 409) {
    return {
      type: ErrorType.VALIDATION,
      title: 'Conflict Detected',
      message: 'The resource was modified by another user. Please refresh and try again.',
      canRetry: true,
      userAction: 'Reload the resource and reapply your changes',
    }
  }

  // Request too large
  if (error.status === 413) {
    return {
      type: ErrorType.VALIDATION,
      title: 'Request Too Large',
      message: 'The data you are trying to save is too large.',
      canRetry: false,
      userAction: 'Reduce the size of your data and try again',
    }
  }

  // Rate limiting
  if (error.status === 429) {
    return {
      type: ErrorType.VALIDATION,
      title: 'Too Many Requests',
      message: 'You are making too many requests. Please wait and try again.',
      canRetry: true,
      userAction: 'Wait a moment before retrying',
    }
  }

  // Server errors
  if (error.status >= 500) {
    return {
      type: ErrorType.SERVER,
      title: 'Server Error',
      message: error.message || 'An error occurred on the server.',
      canRetry: true,
      userAction: 'Check Gateway logs for details and try again',
    }
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    title: 'Unknown Error',
    message: error.message || 'An unexpected error occurred.',
    canRetry: true,
    userAction: 'Please try again or contact support',
  }
}

/**
 * Format error for display to user
 */
export function formatErrorMessage(error: any): string {
  const apiError = parseError(error)
  const errorInfo = getErrorInfo(apiError)
  return `${errorInfo.title}: ${errorInfo.message}`
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: any): boolean {
  const apiError = parseError(error)
  const errorInfo = getErrorInfo(apiError)
  return errorInfo.canRetry
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw error
      }

      // Don't delay after last attempt
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Log error to console with context
 */
export function logError(context: string, error: any, additionalInfo?: any) {
  const apiError = parseError(error)
  console.error(`[${context}]`, {
    status: apiError.status,
    message: apiError.message,
    context: apiError.context,
    additionalInfo,
    originalError: apiError.originalError,
  })
}

/**
 * Create a standardized error message for a failed operation
 */
export function createOperationError(operation: string, resourceType: string, error: any): string {
  const apiError = parseError(error)
  const errorInfo = getErrorInfo(apiError)

  return `Failed to ${operation} ${resourceType}: ${errorInfo.message}`
}

/**
 * Get user action suggestion for an error
 */
export function getUserAction(error: any): string | undefined {
  const apiError = parseError(error)
  const errorInfo = getErrorInfo(apiError)
  return errorInfo.userAction
}

/**
 * Check if error is a specific type
 */
export function isNetworkError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status === 0
}

export function isAuthenticationError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status === 401
}

export function isAuthorizationError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status === 403
}

export function isNotFoundError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status === 404
}

export function isValidationError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status === 400 || apiError.status === 409 || apiError.status === 413
}

export function isServerError(error: any): boolean {
  const apiError = parseError(error)
  return apiError.status >= 500
}
