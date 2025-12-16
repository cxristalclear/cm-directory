/**
 * Rate limiting utility for API endpoints
 * Uses in-memory storage (simple implementation for single-instance deployments)
 * For production with multiple instances, consider using Redis or similar
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// In production with multiple instances, use Redis or similar distributed store
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional identifier for the rate limit (e.g., user ID, IP address) */
  identifier?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of requests remaining in the current window */
  remaining: number
  /** Time when the rate limit window resets (Unix timestamp in ms) */
  resetTime: number
  /** Error message if rate limit exceeded */
  error?: string
}

/**
 * Cleans up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Checks if a request should be rate limited
 * @param key - Unique key for rate limiting (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs } = config
  const now = Date.now()

  // Clean up expired entries periodically (every 1000 calls)
  if (Math.random() < 0.001) {
    cleanupExpiredEntries()
  }

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new rate limit window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Existing window
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: `Rate limit exceeded. Please try again after ${new Date(entry.resetTime).toISOString()}`,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Gets a rate limit key from a request
 * Uses IP address or user ID if available
 */
export function getRateLimitKey(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Try to get IP address from headers (handle missing headers gracefully)
  if (!request.headers) {
    return 'ip:unknown'
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

  return `ip:${ip}`
}

