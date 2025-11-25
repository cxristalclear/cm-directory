// lib/supabase-client.ts - Client-side Supabase for browser components
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { supabaseConfig } from './config'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

class SafeCookieStorage {
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null
    try {
      const cookies = document.cookie.split('; ')
      for (const cookie of cookies) {
        const [name, value] = cookie.split('=')
        if (name === key && value) {
          return decodeURIComponent(value)
        }
      }
      return null
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return
    try {
      const encodedValue = encodeURIComponent(value)
      document.cookie = `${key}=${encodedValue}; path=/; max-age=31536000; Secure; SameSite=Lax`
    } catch {
      // Silently ignore
    }
  }

  removeItem(key: string): void {
    if (typeof document === 'undefined') return
    try {
      document.cookie = `${key}=; path=/; max-age=0`
    } catch {
      // Silently ignore
    }
  }
}

export function createClient() {
  if (supabaseClient) return supabaseClient

  const storage = new SafeCookieStorage()

  supabaseClient = createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )

  return supabaseClient
}
