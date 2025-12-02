import mapboxgl from 'mapbox-gl'
import DOMPurify from 'dompurify'

export interface PopupContent {
  title: string
  subtitle?: string
  detailLabel?: string
  linkUrl?: string
  linkText?: string
  className?: string
}

// Type for unvalidated input data
export interface PopupDataInput {
  title?: unknown
  subtitle?: unknown
  detailLabel?: unknown
  linkUrl?: unknown
  linkText?: unknown
  className?: unknown
}

/**
 * Creates a secure Mapbox popup using DOM construction
 * Prevents XSS attacks by using textContent for all dynamic values
 */
export function createSecurePopup(content: PopupContent, options?: mapboxgl.PopupOptions): mapboxgl.Popup {
  const popupOptions: mapboxgl.PopupOptions = {
    offset: 25,
    ...(options || {}),
  }

  const popup = new mapboxgl.Popup(popupOptions)
  popup.addClassName('cm-popup')
  
  // Create DOM elements safely
  const container = document.createElement('div')
  container.className =
    content.className ||
    'w-56 space-y-1.5 rounded-lg border border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm'

  if (content.detailLabel) {
    const badgeElement = document.createElement('span')
    badgeElement.className = 'inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600'
    badgeElement.textContent = content.detailLabel
    container.appendChild(badgeElement)
  }
  
  // Title
  if (content.title) {
    const titleElement = document.createElement('h3')
    titleElement.className = 'text-sm font-semibold text-slate-900'
    titleElement.textContent = content.title // Safe: uses textContent
    container.appendChild(titleElement)
  }
  
  // Subtitle
  if (content.subtitle) {
    const subtitleElement = document.createElement('p')
    subtitleElement.className = 'text-xs text-slate-600'
    subtitleElement.textContent = content.subtitle // Safe: uses textContent
    container.appendChild(subtitleElement)
  }
  
  // Link
  if (content.linkUrl && content.linkText) {
    const linkElement = document.createElement('a')
    linkElement.className =
      'inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full px-1.5 py-0.5'
    linkElement.textContent = content.linkText // Safe: uses textContent
    
    // Sanitize URL to prevent javascript: protocol attacks
    const sanitizedUrl = sanitizeUrl(content.linkUrl)
    if (sanitizedUrl) {
      linkElement.href = sanitizedUrl
    }
    
    const arrowElement = document.createElement('span')
    arrowElement.className = 'text-base'
    arrowElement.setAttribute('aria-hidden', 'true')
    arrowElement.textContent = '→'
    linkElement.appendChild(arrowElement)
    
    container.appendChild(linkElement)
  }
  
  popup.setDOMContent(container)
  return popup
}

/**
 * Alternative: Create popup with sanitized HTML (if HTML formatting is required)
 * Uses DOMPurify with strict configuration
 */
export function createSanitizedPopup(htmlContent: string, options?: mapboxgl.PopupOptions): mapboxgl.Popup {
  const popup = new mapboxgl.Popup(options || { offset: 25 })
  
  // Check if we're in a browser environment
  let cleanHTML: string
  if (typeof window !== 'undefined' && DOMPurify.sanitize) {
    // Configure DOMPurify for maximum security
    cleanHTML = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['div', 'h3', 'p', 'a', 'span', 'strong', 'em'],
      ALLOWED_ATTR: ['class', 'href'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
    })
  } else {
    // Fallback for test environment - just strip obvious script tags
    cleanHTML = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
  }
  
  const container = document.createElement('div')
  container.innerHTML = cleanHTML
  
  // Additional check: Sanitize all href attributes
  container.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href')
    if (href) {
      const sanitizedUrl = sanitizeUrl(href)
      if (sanitizedUrl) {
        link.setAttribute('href', sanitizedUrl)
      } else {
        link.removeAttribute('href')
      }
    }
  })
  
  popup.setDOMContent(container)
  return popup
}

/**
 * Sanitizes URLs to prevent XSS via javascript: protocol
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  
  // Remove whitespace and convert to lowercase for checking
  const cleanUrl = url.trim().toLowerCase()
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  if (dangerousProtocols.some(protocol => cleanUrl.startsWith(protocol))) {
    console.warn(`Blocked potentially dangerous URL: ${url}`)
    return null
  }
  
  // For relative URLs, ensure they start with /
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
    return '/' + url
  }
  
  return url
}

/**
 * Type guard to check if a value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is an object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Runtime validation for popup data
 */
export function validatePopupData(data: unknown): PopupContent | null {
  if (!isObject(data)) {
    console.error('Invalid popup data: not an object')
    return null
  }
  
  // Type assertion after validation
  const inputData = data as PopupDataInput
  
  // Ensure required fields exist and are strings
  if (!isString(inputData.title)) {
    console.error('Invalid popup data: title must be a string')
    return null
  }
  
  // Validate optional fields
  const validated: PopupContent = {
    title: inputData.title.substring(0, 200), // Limit length
  }
  
  if (inputData.subtitle !== undefined) {
    if (isString(inputData.subtitle)) {
      validated.subtitle = inputData.subtitle.substring(0, 200)
    }
  }

  if (inputData.detailLabel !== undefined) {
    if (isString(inputData.detailLabel)) {
      validated.detailLabel = inputData.detailLabel.substring(0, 60)
    }
  }
  
  if (inputData.linkUrl !== undefined && inputData.linkText !== undefined) {
    if (isString(inputData.linkUrl) && isString(inputData.linkText)) {
      validated.linkUrl = inputData.linkUrl.substring(0, 500)
      validated.linkText = inputData.linkText.substring(0, 100)
    }
  }
  
  if (inputData.className !== undefined) {
    if (isString(inputData.className)) {
      // Sanitize className to prevent attribute injection
      validated.className = inputData.className
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        .substring(0, 100)
    }
  }
  
  return validated
}

/**
 * Helper function to safely extract text from potentially unsafe data
 */
export function safeExtractText(value: unknown, maxLength: number = 200): string {
  if (!isString(value)) {
    return ''
  }
  return value.substring(0, maxLength)
}

/**
 * Create a popup from facility data with proper type safety
 */
export function createPopupFromFacility(
  facility: {
    company?: {
      company_name?: string | null
      slug?: string | null
    }
    city?: string | null
    state_province?: string | null
    state?: string | null
    country?: string | null
    facility_type?: string | null
  },
  options?: mapboxgl.PopupOptions
): mapboxgl.Popup {
  const popupData: PopupContent = {
    title: facility.company?.company_name || 'Unknown Company',
    subtitle: formatLocationLabel(facility),
    detailLabel: formatFacilityTypeLabel(facility.facility_type),
  }
  
  // Only add link if slug exists
  if (facility.company?.slug) {
    popupData.linkUrl = `/companies/${facility.company.slug}`
    popupData.linkText = 'View Details'
  }
  
  return createSecurePopup(popupData, options)
}

function formatLocationLabel(facility: {
  city?: string | null
  state_province?: string | null
  state?: string | null
  country?: string | null
}): string {
  const segments = [facility.city, facility.state_province || facility.state, facility.country]
    .map(segment => (segment || '').trim())
    .filter(Boolean)

  return segments.length > 0 ? segments.join(', ') : 'Location unavailable'
}

function formatFacilityTypeLabel(type?: string | null): string | undefined {
  if (!type) {
    return undefined
  }

  const normalized = type.replace(/[_-]+/g, ' ').trim()
  if (!normalized) {
    return undefined
  }

  return normalized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
