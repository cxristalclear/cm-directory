// types/next.d.ts
// Type definitions for Next.js 15 to properly handle async params and searchParams

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      NEXT_PUBLIC_MAPBOX_TOKEN?: string
      NEXT_PUBLIC_SITE_URL?: string
      NEXT_PUBLIC_SITE_NAME?: string
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      NEXT_PUBLIC_SHOW_DEBUG?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
