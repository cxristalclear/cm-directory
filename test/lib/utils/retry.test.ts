import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry'

describe('retry utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isRetryableError', () => {
    it('should retry on network errors', () => {
      const error = new TypeError('fetch failed')
      expect(isRetryableError(error)).toBe(true)
    })

    it('should retry on 5xx server errors', () => {
      const error = { status: 500, message: 'Internal Server Error' }
      expect(isRetryableError(error)).toBe(true)

      const error502 = { status: 502, message: 'Bad Gateway' }
      expect(isRetryableError(error502)).toBe(true)
    })

    it('should retry on 429 rate limit errors', () => {
      const error = { status: 429, message: 'Too Many Requests' }
      expect(isRetryableError(error)).toBe(true)
    })

    it('should retry on connection errors', () => {
      const error = { code: 'ECONNREFUSED' }
      expect(isRetryableError(error)).toBe(true)

      const timeoutError = { code: 'ETIMEDOUT' }
      expect(isRetryableError(timeoutError)).toBe(true)
    })

    it('should not retry on 4xx client errors (except 429)', () => {
      const error400 = { status: 400, message: 'Bad Request' }
      expect(isRetryableError(error400)).toBe(false)

      const error404 = { status: 404, message: 'Not Found' }
      expect(isRetryableError(error404)).toBe(false)

      const error403 = { status: 403, message: 'Forbidden' }
      expect(isRetryableError(error403)).toBe(false)
    })

    it('should not retry on non-error values', () => {
      expect(isRetryableError(null)).toBe(false)
      expect(isRetryableError(undefined)).toBe(false)
      expect(isRetryableError('string')).toBe(false)
    })
  })

  describe('retryWithBackoff', () => {
    it('should return data on first successful attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await retryWithBackoff(mockFn, { maxAttempts: 3 })

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(1)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on transient errors and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 502 })
        .mockResolvedValueOnce('success')

      // Use very short delays for testing
      const result = await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelayMs: 10, // Short delay for tests
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(3)
      expect(mockFn).toHaveBeenCalledTimes(3)
    }, 10000) // Increase timeout for this test

    it('should stop retrying after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue({ status: 500 })

      const result = await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelayMs: 10, // Short delay for tests
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.attempts).toBe(3)
      expect(mockFn).toHaveBeenCalledTimes(3)
    }, 10000) // Increase timeout for this test

    it('should not retry non-retryable errors', async () => {
      const error400 = { status: 400, message: 'Bad Request' }
      const mockFn = jest.fn().mockRejectedValue(error400)

      const result = await retryWithBackoff(mockFn, { maxAttempts: 3 })

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(1) // Only one attempt
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should call onRetry callback on each retry', async () => {
      const onRetry = jest.fn()
      const mockFn = jest.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValueOnce('success')

      const result = await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelayMs: 10, // Short delay for tests
        onRetry,
      })

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Object))
      expect(result.success).toBe(true)
    }, 10000)

    it('should respect maxDelayMs', async () => {
      const mockFn = jest.fn().mockRejectedValue({ status: 500 })

      const result = await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        maxDelayMs: 20, // Small max delay for testing
        factor: 2,
        jitter: false,
      })

      expect(result.success).toBe(false)
      expect(mockFn).toHaveBeenCalledTimes(3)
    }, 10000)
  })
})

