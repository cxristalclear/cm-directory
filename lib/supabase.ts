import { createClient } from "@supabase/supabase-js"
import { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export commonly used types
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Facility = Database['public']['Tables']['facilities']['Row']
export type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
export type FacilityUpdate = Database['public']['Tables']['facilities']['Update']

export type Capabilities = Database['public']['Tables']['capabilities']['Row']
export type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
export type CapabilitiesUpdate = Database['public']['Tables']['capabilities']['Update']

export type Industry = Database['public']['Tables']['industries']['Row']
export type IndustryInsert = Database['public']['Tables']['industries']['Insert']
export type IndustryUpdate = Database['public']['Tables']['industries']['Update']

export type Certification = Database['public']['Tables']['certifications']['Row']
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
export type CertificationUpdate = Database['public']['Tables']['certifications']['Update']

export type TechnicalSpecs = Database['public']['Tables']['technical_specs']['Row']
export type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
export type TechnicalSpecsUpdate = Database['public']['Tables']['technical_specs']['Update']

export type BusinessInfo = Database['public']['Tables']['business_info']['Row']
export type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']
export type BusinessInfoUpdate = Database['public']['Tables']['business_info']['Update']