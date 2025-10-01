/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */

// Validate required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const

// Check for missing required environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(
    `Missing required environment variables:\n${missingEnvVars.join('\n')}\n\nPlease check your .env.local file.`
  )
}

// Site configuration
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'CM Directory',
  description: 'Find and connect with verified contract manufacturers worldwide',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cm-directory.vercel.app',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cm-directory.vercel.app'}/og-image.png`,
  links: {
    twitter: 'https://twitter.com/your_handle',
    github: 'https://github.com/your_repo',
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
