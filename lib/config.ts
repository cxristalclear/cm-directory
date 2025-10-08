/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */

// Validate required environment variables
const supabaseEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const

const metadataEnvVars = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL,
  NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
} as const

// Check for missing required environment variables
const missingSupabaseEnvVars = Object.entries(supabaseEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingSupabaseEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(
    `Missing required environment variables:\n${missingSupabaseEnvVars.join('\n')}\n\nPlease check your .env.local file.`
  )
}

const missingMetadataEnvVars = Object.entries(metadataEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingMetadataEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(
    `Missing optional environment variables:\n${missingMetadataEnvVars.join('\n')}\n\nFalling back to documented production defaults. Set these values in your environment for accurate site metadata.`
  )
}

// Flag obviously placeholder values so they can't silently reach production
const placeholderPatterns = [/your_/i, /example\.com/i, /yourdomain\.com/i, /placeholder/i]
const flaggedEnvVars = Object.entries({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL,
  NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
}).filter(([, value]) =>
  typeof value === 'string' && placeholderPatterns.some((pattern) => pattern.test(value))
)

if (flaggedEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  const keys = flaggedEnvVars.map(([key]) => key)
  throw new Error(
    `Placeholder environment variable(s) detected:\n${keys.join('\n')}\n\nPlease update the values before deploying.`
  )
}

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

const defaultSiteUrl = 'https://www.cm-directory.com'
const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl)

const defaultSocialLinks = {
  twitter: 'https://twitter.com/cmdirectory',
  linkedin: 'https://www.linkedin.com/company/cm-directory',
  github: 'https://github.com/cm-directory/app',
} as const

// Site configuration
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'CM Directory',
  description: 'Find and connect with verified contract manufacturers worldwide',
  url: siteUrl,
  ogImage: `${siteUrl}/og-image.png`,
  links: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || defaultSocialLinks.twitter,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || defaultSocialLinks.linkedin,
    github: process.env.NEXT_PUBLIC_GITHUB_URL || defaultSocialLinks.github,
  },
} as const

// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const

// Mapbox configuration
export const mapboxConfig = {
  token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  enabled: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN && process.env.NEXT_PUBLIC_MAPBOX_TOKEN !== 'pk.demo_token'),
} as const

// Analytics configuration
export const analyticsConfig = {
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
} as const

// Feature flags
export const featureFlags = {
  showDebug: process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true',
} as const

// Environment info
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// Helper function to build absolute URLs
export function getAbsoluteUrl(path: string = ''): string {
  const base = siteConfig.url
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

// Helper function for canonical URLs
export function getCanonicalUrl(path: string = ''): string {
  return getAbsoluteUrl(path)
}

// Export all as a single config object
export const config = {
  site: siteConfig,
  supabase: supabaseConfig,
  mapbox: mapboxConfig,
  analytics: analyticsConfig,
  features: featureFlags,
  env,
} as const

export default config
