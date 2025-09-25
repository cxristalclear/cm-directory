import { createClient } from "@supabase/supabase-js"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name} for Supabase client. ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect.",
    )
  }
  return value
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          company_name: string
          slug: string
          dba_name: string | null
          website_url: string | null
          year_founded: number | null
          employee_count_range: string | null
          annual_revenue_range: string | null
          logo_url: string | null
          description: string | null
          key_differentiators: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_verified_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      facilities: {
        Row: {
          id: string
          company_id: string
          facility_type: string | null
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          is_primary: boolean | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      capabilities: {
        Row: {
          id: string
          company_id: string
          pcb_assembly_smt: boolean | null
          pcb_assembly_through_hole: boolean | null
          pcb_assembly_mixed: boolean | null
          pcb_assembly_fine_pitch: boolean | null
          cable_harness_assembly: boolean | null
          box_build_assembly: boolean | null
          prototyping: boolean | null
          low_volume_production: boolean | null
          medium_volume_production: boolean | null
          high_volume_production: boolean | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          company_id: string
          certification_type: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      industries: {
        Row: {
          id: string
          company_id: string
          industry_name: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
