/**
 * Centralized Error Handling System
 * Provides consistent error handling across the application
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
}

export class GoogleAPIError extends Error {
  public readonly code: string;
  public readonly details: any;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    code: string = 'GOOGLE_API_ERROR',
    details: any = null,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'GoogleAPIError';
    this.code = code;
    this.details = details;
    this.context = context;
  }
}

export class ConfigurationError extends Error {
  public readonly code: string;
  public readonly missing: string[];

  constructor(message: string, missing: string[] = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = 'CONFIG_ERROR';
    this.missing = missing;
  }
}

export class ValidationError extends Error {
  public readonly code: string;
  public readonly field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.field = field;
  }
}

/**
 * Create a standardized error object
 */
export function createError(
  message: string,
  code: string = 'UNKNOWN_ERROR',
  details: any = null,
  context: Record<string, any> = {}
): AppError {
  return {
    code,
    message,
    details,
    stack: new Error().stack,
    timestamp: new Date().toISOString(),
    context
  };
}

/**
 * Log error with context
 */
export function logError(error: Error | AppError, context: Record<string, any> = {}): void {
  const errorObj = error instanceof Error ? createError(error.message, 'UNKNOWN_ERROR', error.stack) : error;
  
  console.error('🚨 Error occurred:', {
    ...errorObj,
    context: { ...errorObj.context, ...context }
  });
}

/**
 * Handle Google API errors with specific error codes
 */
export function handleGoogleAPIError(error: any, operation: string, context: Record<string, any> = {}): GoogleAPIError {
  let code = 'GOOGLE_API_ERROR';
  let message = 'Google API operation failed';
  
  if (error.code) {
    switch (error.code) {
      case 400:
        code = 'GOOGLE_API_BAD_REQUEST';
        message = 'Invalid request to Google API';
        break;
      case 401:
        code = 'GOOGLE_API_UNAUTHORIZED';
        message = 'Google API authentication failed';
        break;
      case 403:
        code = 'GOOGLE_API_FORBIDDEN';
        message = 'Google API access forbidden';
        break;
      case 404:
        code = 'GOOGLE_API_NOT_FOUND';
        message = 'Google API resource not found';
        break;
      case 429:
        code = 'GOOGLE_API_RATE_LIMIT';
        message = 'Google API rate limit exceeded';
        break;
      case 500:
        code = 'GOOGLE_API_SERVER_ERROR';
        message = 'Google API server error';
        break;
      default:
        code = `GOOGLE_API_ERROR_${error.code}`;
        message = `Google API error: ${error.message}`;
    }
  }
  
  if (error.message?.includes('quota')) {
    code = 'GOOGLE_API_QUOTA_EXCEEDED';
    message = 'Google API quota exceeded';
  }
  
  if (error.message?.includes('Invalid JWT')) {
    code = 'GOOGLE_API_JWT_ERROR';
    message = 'Google API JWT signature invalid';
  }
  
  return new GoogleAPIError(
    `${operation}: ${message}`,
    code,
    error,
    { operation, ...context }
  );
}

/**
 * Handle configuration errors
 */
export function handleConfigurationError(missing: string[]): ConfigurationError {
  return new ConfigurationError(
    `Missing required configuration: ${missing.join(', ')}`,
    missing
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(field: string, message: string): ValidationError {
  return new ValidationError(message, field);
}

/**
 * Safe async wrapper with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: Record<string, any> = {},
  fallback?: T
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const appError = createError(
      error instanceof Error ? error.message : 'Unknown error',
      'ASYNC_OPERATION_ERROR',
      error,
      context
    );
    
    logError(appError, context);
    
    if (fallback !== undefined) {
      return { success: true, data: fallback };
    }
    
    return { success: false, error: appError };
  }
}
