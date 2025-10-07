// types/next.d.ts - Type definitions for Next.js 15

import { NextRequest } from 'next/server'

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

// Ensure params and searchParams are properly typed as Promises in Next.js 15
export type PageProps<
  TParams extends Record<string, string | string[]> = Record<string, string | string[]>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
> = {
  params: Promise<TParams>
  searchParams: Promise<TSearchParams>
}

export type LayoutProps<
  TParams extends Record<string, string | string[]> = Record<string, string | string[]>
> = {
  children: React.ReactNode
  params: Promise<TParams>
}

export {}