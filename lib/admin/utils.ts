import type { SupabaseClient } from '@supabase/supabase-js'
import type { CompanyFormData } from '@/types/admin'
import type { Json } from '@/lib/database.types'

type ChangeTrackedValue = string | number | boolean | null | Json | undefined
type ChangeTrackingSnapshot = Partial<Record<string, ChangeTrackedValue>>

function serializeAuditValue(value: ChangeTrackedValue): string | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch (error) {
    console.warn('Failed to serialize audit value, falling back to String:', error)
    return String(value)
  }
}

/**
 * Generate a URL-friendly slug from company name
 */
export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if slug is unique, append number if not
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  slug: string,
  excludeId?: string
): Promise<string> {
  let uniqueSlug = slug
  let counter = 1

  while (true) {
    const query = supabase
      .from('companies')
      .select('id')
      .eq('slug', uniqueSlug)

    if (excludeId) {
      query.neq('id', excludeId)
    }

    const { data } = await query.maybeSingle()

    if (!data) {
      return uniqueSlug
    }

    uniqueSlug = `${slug}-${counter}`
    counter++
  }
}

/**
 * Compare two objects and return array of changes
 */
export function getFieldChanges<
  OldData extends ChangeTrackingSnapshot,
  NewData extends ChangeTrackingSnapshot
>(
  oldData: OldData,
  newData: NewData
): Array<{
  field_name: string
  old_value: string | null
  new_value: string | null
}> {
  const changes: Array<{
    field_name: string
    old_value: string | null
    new_value: string | null
  }> = []

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

  for (const key of allKeys) {
    // Skip metadata fields that change automatically
    if (['updated_at', 'created_at', 'id'].includes(key)) {
      continue
    }

    const oldValue = oldData[key]
    const newValue = newData[key]

    const oldStr = serializeAuditValue(oldValue)
    const newStr = serializeAuditValue(newValue)

    if (oldStr !== newStr) {
      changes.push({
        field_name: key,
        old_value: oldStr,
        new_value: newStr,
      })
    }
  }

  return changes
}

/**
 * Log changes to company_change_log table
 */
export async function logCompanyChanges(
  supabase: SupabaseClient,
  companyId: string,
  changes: Array<{
    field_name: string
    old_value: string | null
    new_value: string | null
  }>,
  userEmail: string,
  userName: string,
  changeType: 'created' | 'updated' | 'claimed' | 'verified' | 'approved' | 'rejected' = 'updated'
) {
  const changeLogEntries = changes.map((change) => ({
    company_id: companyId,
    changed_by_email: userEmail,
    changed_by_name: userName,
    change_type: changeType,
    field_name: change.field_name,
    old_value: change.old_value,
    new_value: change.new_value,
    changed_at: new Date().toISOString(),
  }))

  if (changeLogEntries.length > 0) {
    const { error } = await supabase
      .from('company_change_log')
      .insert(changeLogEntries)

    if (error) {
      console.error('Error logging changes:', error)
      throw error
    }
  }
}

/**
 * Validate required company fields
 */
export function validateCompanyData(data: CompanyFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.company_name || data.company_name.trim() === '') {
    errors.push('Company name is required')
  }

  // Website is optional, but if provided, it must be valid
  if (data.website_url && typeof data.website_url === 'string' && data.website_url.trim()) {
    if (!isValidUrl(data.website_url)) {
      errors.push('Website URL is invalid. Please use a format like https://example.com or example.com')
    }
  }

  if (data.year_founded) {
    const year = parseInt(String(data.year_founded))
    const currentYear = new Date().getFullYear()
    if (year < 1800 || year > currentYear) {
      errors.push(`Year founded must be between 1800 and ${currentYear}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate URL format - must have protocol for this function
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Normalize website URL to ensure it has a valid protocol (https:// or http://)
 * Smart handling for common cases:
 * - If already has protocol, validate and return as-is
 * - If has www. prefix but no protocol, add https://
 * - Otherwise, add https:// by default
 * - Returns empty string if URL is invalid
 */
export function normalizeWebsiteUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  const trimmed = url.trim()
  if (!trimmed) return ''
  
  // Already has protocol
  const lowerUrl = trimmed.toLowerCase()
  if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
    if (isValidUrl(trimmed)) {
      return trimmed
    }
    console.warn(`URL validation failed for: ${trimmed}`)
    return ''
  }
  
  // Try with https:// first (more secure default)
  const normalizedHttps = `https://${trimmed}`
  if (isValidUrl(normalizedHttps)) {
    return normalizedHttps
  }
  
  // Fall back to http:// if https fails
  const normalizedHttp = `http://${trimmed}`
  if (isValidUrl(normalizedHttp)) {
    return normalizedHttp
  }
  
  // Both failed - URL is invalid
  console.warn(`URL normalization failed for: ${url}`)
  return ''
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
