/**
 * Validation utilities for user input and URL parameters
 */

/**
 * Sanitizes a search query to prevent XSS attacks
 * Removes HTML tags and dangerous characters while preserving search functionality
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = query.replace(/<[^>]*>/g, '')
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  
  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validates search query length
 * @param query - The search query to validate
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 200)
 * @returns Object with valid flag and sanitized query
 */
export function validateSearchQuery(
  query: string | null | undefined,
  minLength: number = 1,
  maxLength: number = 200
): { valid: boolean; sanitized: string; error?: string } {
  if (!query) {
    return { valid: false, sanitized: '', error: 'Search query is required' }
  }

  const sanitized = sanitizeSearchQuery(query)

  if (sanitized.length < minLength) {
    return {
      valid: false,
      sanitized: '',
      error: `Search query must be at least ${minLength} character${minLength !== 1 ? 's' : ''}`,
    }
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      sanitized: sanitized.substring(0, maxLength),
      error: `Search query must be no more than ${maxLength} characters`,
    }
  }

  return { valid: true, sanitized }
}

/**
 * Validates a company slug format
 * Company slugs should be lowercase alphanumeric with hyphens
 * @param slug - The slug to validate
 * @returns true if valid format, false otherwise
 */
export function isValidCompanySlug(slug: string | null | undefined): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  // Company slugs are lowercase, alphanumeric with hyphens
  // Should not be empty, should not start/end with hyphen
  // Max length reasonable for URLs (100 chars)
  const slugPattern = /^[a-z0-9]([a-z0-9-]{0,98}[a-z0-9])?$/
  
  return slugPattern.test(slug) && slug.length <= 100
}

/**
 * Validates a state slug format
 * State slugs should be lowercase alphanumeric with hyphens
 * @param slug - The slug to validate
 * @returns true if valid format, false otherwise
 */
export function isValidStateSlug(slug: string | null | undefined): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  // State slugs are lowercase, alphanumeric with hyphens
  // Should not be empty, should not start/end with hyphen
  // Max length reasonable for state names (50 chars)
  const slugPattern = /^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/
  
  return slugPattern.test(slug) && slug.length <= 50
}

