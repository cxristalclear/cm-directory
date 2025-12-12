/**
 * Retry utility with exponential backoff and jitter
 * Best practices from Airbnb, Stripe, and other D2C companies
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  factor?: number
  jitter?: boolean
  onRetry?: (attempt: number, error: Error) => void
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
}

/**
 * Exponential backoff with jitter calculation
 * Prevents thundering herd problem
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  factor: number,
  jitter: boolean
): number {
  const exponentialDelay = initialDelayMs * Math.pow(factor, attempt - 1)
  const delay = Math.min(exponentialDelay, maxDelayMs)
  
  if (jitter) {
    // Add random jitter (±20%) to prevent synchronized retries
    const jitterAmount = delay * 0.2 * (Math.random() * 2 - 1)
    return Math.max(0, delay + jitterAmount)
  }
  
  return delay
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable (transient errors only)
 * Retry on: network errors, 5xx server errors, timeouts
 * Don't retry on: 4xx client errors (except 429 rate limit)
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false

  // Network errors (no response from server)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  // Check if it's a Supabase/HTTP error with status code
  if (error && typeof error === 'object') {
    const err = error as { code?: string; status?: number; message?: string }
    
    // Retry on 5xx server errors
    if (err.status && err.status >= 500 && err.status < 600) {
      return true
    }
    
    // Retry on 429 (rate limit) - transient
    if (err.status === 429) {
      return true
    }
    
    // Retry on connection/timeout errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return true
    }
    
    // Supabase specific retryable errors
    if (err.code === 'PGRST301' || err.code === '57014') { // timeout codes
      return true
    }
  }

  return false
}

/**
 * Retry a function with exponential backoff and jitter
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Promise with result or error after all retries exhausted
 * 
 * @example
 * const result = await retryWithBackoff(
 *   () => fetchData(),
 *   { maxAttempts: 3, initialDelayMs: 1000 }
 * )
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    factor = 2,
    jitter = true,
    onRetry,
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        return {
          success: false,
          error: lastError,
          attempts: attempt,
        }
      }

      // Don't delay after last attempt
      if (attempt < maxAttempts) {
        const delay = calculateDelay(
          attempt,
          initialDelayMs,
          maxDelayMs,
          factor,
          jitter
        )

        // Notify about retry
        if (onRetry) {
          onRetry(attempt, lastError)
        }

        await sleep(delay)
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
  }
}

