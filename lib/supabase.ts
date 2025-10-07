// lib/supabase.ts - Type-safe Supabase client with complete database types

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// JSON types for flexible data structures
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Change summary structure for audit logs
export interface ChangeLogSummary {
  total_changes: number
  fields_changed: string[]
  change_description?: string
  metadata?: Record<string, string | number | boolean>
}

// Proposed changes structure for pending updates
export interface ProposedChanges {
  fields: Record<string, {
    old_value: string | number | boolean | null
    new_value: string | number | boolean | null
  }>
  reason?: string
  notes?: string
}

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          // Primary fields
          id: string
          company_name: string
          dba_name: string | null
          slug: string
          description: string | null
          website_url: string | null
          year_founded: number | null
          employee_count_range: string | null
          annual_revenue_range: string | null
          key_differentiators: string | null
          logo_url: string | null
          
          // Status fields
          is_active: boolean
          is_verified: boolean
          last_verified_date: string | null
          
          // Metadata
          created_at: string
          updated_at: string
          
          // Claim tracking fields
          claim_status: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email: string | null
          claimed_by_name: string | null
          claimed_at: string | null
          claim_approved_by: string | null
          claim_approved_at: string | null
          claim_rejection_reason: string | null
          
          // Verification badge fields (5-year validity)
          verified_by: string | null
          verified_at: string | null
          verified_until: string | null
          
          // Update tracking fields
          has_pending_updates: boolean
          last_reviewed_at: string | null
          last_reviewed_by: string | null
        }
        Insert: {
          id?: string
          company_name: string
          dba_name?: string | null
          slug: string
          description?: string | null
          website_url?: string | null
          year_founded?: number | null
          employee_count_range?: string | null
          annual_revenue_range?: string | null
          key_differentiators?: string | null
          logo_url?: string | null
          is_active?: boolean
          is_verified?: boolean
          last_verified_date?: string | null
          created_at?: string
          updated_at?: string
          claim_status?: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          claimed_at?: string | null
          claim_approved_by?: string | null
          claim_approved_at?: string | null
          claim_rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verified_until?: string | null
          has_pending_updates?: boolean
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          dba_name?: string | null
          slug?: string
          description?: string | null
          website_url?: string | null
          year_founded?: number | null
          employee_count_range?: string | null
          annual_revenue_range?: string | null
          key_differentiators?: string | null
          logo_url?: string | null
          is_active?: boolean
          is_verified?: boolean
          last_verified_date?: string | null
          created_at?: string
          updated_at?: string
          claim_status?: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          claimed_at?: string | null
          claim_approved_by?: string | null
          claim_approved_at?: string | null
          claim_rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verified_until?: string | null
          has_pending_updates?: boolean
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
        }
      }
      
      facilities: {
        Row: {
          id: string
          company_id: string
          facility_type: string
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          location: Json | null
          facility_size_sqft: number | null
          employees_at_location: number | null
          key_capabilities: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          facility_type: string
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          location?: Json | null
          facility_size_sqft?: number | null
          employees_at_location?: number | null
          key_capabilities?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          facility_type?: string
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          location?: Json | null
          facility_size_sqft?: number | null
          employees_at_location?: number | null
          key_capabilities?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
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
          testing_ict: boolean | null
          testing_functional: boolean | null
          testing_environmental: boolean | null
          testing_rf_wireless: boolean | null
          design_services: boolean | null
          supply_chain_management: boolean | null
          prototyping: boolean | null
          low_volume_production: boolean | null
          medium_volume_production: boolean | null
          high_volume_production: boolean | null
          turnkey_services: boolean | null
          consigned_services: boolean | null
          last_verified_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          pcb_assembly_smt?: boolean | null
          pcb_assembly_through_hole?: boolean | null
          pcb_assembly_mixed?: boolean | null
          pcb_assembly_fine_pitch?: boolean | null
          cable_harness_assembly?: boolean | null
          box_build_assembly?: boolean | null
          testing_ict?: boolean | null
          testing_functional?: boolean | null
          testing_environmental?: boolean | null
          testing_rf_wireless?: boolean | null
          design_services?: boolean | null
          supply_chain_management?: boolean | null
          prototyping?: boolean | null
          low_volume_production?: boolean | null
          medium_volume_production?: boolean | null
          high_volume_production?: boolean | null
          turnkey_services?: boolean | null
          consigned_services?: boolean | null
          last_verified_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          pcb_assembly_smt?: boolean | null
          pcb_assembly_through_hole?: boolean | null
          pcb_assembly_mixed?: boolean | null
          pcb_assembly_fine_pitch?: boolean | null
          cable_harness_assembly?: boolean | null
          box_build_assembly?: boolean | null
          testing_ict?: boolean | null
          testing_functional?: boolean | null
          testing_environmental?: boolean | null
          testing_rf_wireless?: boolean | null
          design_services?: boolean | null
          supply_chain_management?: boolean | null
          prototyping?: boolean | null
          low_volume_production?: boolean | null
          medium_volume_production?: boolean | null
          high_volume_production?: boolean | null
          turnkey_services?: boolean | null
          consigned_services?: boolean | null
          last_verified_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      industries: {
        Row: {
          id: string
          company_id: string
          industry_name: string
          is_specialization: boolean | null
          years_experience: number | null
          notable_projects: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          industry_name: string
          is_specialization?: boolean | null
          years_experience?: number | null
          notable_projects?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          industry_name?: string
          is_specialization?: boolean | null
          years_experience?: number | null
          notable_projects?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      certifications: {
        Row: {
          id: string
          company_id: string
          certification_type: string
          status: string | null
          certificate_number: string | null
          issued_date: string | null
          expiration_date: string | null
          issuing_body: string | null
          scope: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          certification_type: string
          status?: string | null
          certificate_number?: string | null
          issued_date?: string | null
          expiration_date?: string | null
          issuing_body?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          certification_type?: string
          status?: string | null
          certificate_number?: string | null
          issued_date?: string | null
          expiration_date?: string | null
          issuing_body?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      technical_specs: {
        Row: {
          id: string
          company_id: string
          smallest_component_size: string | null
          finest_pitch_capability: string | null
          max_pcb_size_inches: string | null
          max_pcb_layers: number | null
          lead_free_soldering: boolean | null
          conformal_coating: boolean | null
          potting_encapsulation: boolean | null
          x_ray_inspection: boolean | null
          aoi_inspection: boolean | null
          flying_probe_testing: boolean | null
          burn_in_testing: boolean | null
          clean_room_class: string | null
          additional_specs: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          smallest_component_size?: string | null
          finest_pitch_capability?: string | null
          max_pcb_size_inches?: string | null
          max_pcb_layers?: number | null
          lead_free_soldering?: boolean | null
          conformal_coating?: boolean | null
          potting_encapsulation?: boolean | null
          x_ray_inspection?: boolean | null
          aoi_inspection?: boolean | null
          flying_probe_testing?: boolean | null
          burn_in_testing?: boolean | null
          clean_room_class?: string | null
          additional_specs?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          smallest_component_size?: string | null
          finest_pitch_capability?: string | null
          max_pcb_size_inches?: string | null
          max_pcb_layers?: number | null
          lead_free_soldering?: boolean | null
          conformal_coating?: boolean | null
          potting_encapsulation?: boolean | null
          x_ray_inspection?: boolean | null
          aoi_inspection?: boolean | null
          flying_probe_testing?: boolean | null
          burn_in_testing?: boolean | null
          clean_room_class?: string | null
          additional_specs?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      
      business_info: {
        Row: {
          id: string
          company_id: string
          min_order_qty: string | null
          prototype_lead_time: string | null
          production_lead_time: string | null
          payment_terms: string | null
          rush_order_capability: boolean | null
          twenty_four_seven_production: boolean | null
          engineering_support_hours: string | null
          sales_territory: string | null
          notable_customers: string | null
          awards_recognition: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          min_order_qty?: string | null
          prototype_lead_time?: string | null
          production_lead_time?: string | null
          payment_terms?: string | null
          rush_order_capability?: boolean | null
          twenty_four_seven_production?: boolean | null
          engineering_support_hours?: string | null
          sales_territory?: string | null
          notable_customers?: string | null
          awards_recognition?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          min_order_qty?: string | null
          prototype_lead_time?: string | null
          production_lead_time?: string | null
          payment_terms?: string | null
          rush_order_capability?: boolean | null
          twenty_four_seven_production?: boolean | null
          engineering_support_hours?: string | null
          sales_territory?: string | null
          notable_customers?: string | null
          awards_recognition?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      contacts: {
        Row: {
          id: string
          company_id: string
          contact_type: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          title: string | null
          email: string | null
          phone: string | null
          extension: string | null
          is_primary: boolean | null
          accepts_cold_outreach: boolean | null
          preferred_contact_method: string | null
          last_contacted: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          contact_type: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          title?: string | null
          email?: string | null
          phone?: string | null
          extension?: string | null
          is_primary?: boolean | null
          accepts_cold_outreach?: boolean | null
          preferred_contact_method?: string | null
          last_contacted?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          contact_type?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          title?: string | null
          email?: string | null
          phone?: string | null
          extension?: string | null
          is_primary?: boolean | null
          accepts_cold_outreach?: boolean | null
          preferred_contact_method?: string | null
          last_contacted?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      
      verification_data: {
        Row: {
          id: string
          company_id: string
          verified_by: string | null
          verification_date: string | null
          verification_method: string | null
          data_confidence: string | null
          venkel_relationship: string | null
          recommended_by: string | null
          internal_notes: string | null
          public_description: string | null
          is_featured_partner: boolean | null
          has_logo: boolean | null
          profile_completeness: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          verified_by?: string | null
          verification_date?: string | null
          verification_method?: string | null
          data_confidence?: string | null
          venkel_relationship?: string | null
          recommended_by?: string | null
          internal_notes?: string | null
          public_description?: string | null
          is_featured_partner?: boolean | null
          has_logo?: boolean | null
          profile_completeness?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          verified_by?: string | null
          verification_date?: string | null
          verification_method?: string | null
          data_confidence?: string | null
          venkel_relationship?: string | null
          recommended_by?: string | null
          internal_notes?: string | null
          public_description?: string | null
          is_featured_partner?: boolean | null
          has_logo?: boolean | null
          profile_completeness?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      
      company_change_log: {
        Row: {
          id: string
          company_id: string
          changed_by_email: string
          changed_by_name: string
          changed_at: string
          change_type: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
          field_name: string | null
          old_value: string | null
          new_value: string | null
          change_summary: ChangeLogSummary | null
          reviewed_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          changed_by_email: string
          changed_by_name: string
          changed_at?: string
          change_type: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          change_summary?: ChangeLogSummary | null
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          changed_by_email?: string
          changed_by_name?: string
          changed_at?: string
          change_type?: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          change_summary?: ChangeLogSummary | null
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      
      pending_company_updates: {
        Row: {
          id: string
          company_id: string
          submitted_by_email: string
          submitted_by_name: string
          submitted_at: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          proposed_changes: ProposedChanges
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          submitted_by_email: string
          submitted_by_name: string
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          proposed_changes: ProposedChanges
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          submitted_by_email?: string
          submitted_by_name?: string
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          proposed_changes?: ProposedChanges
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      claim_status_enum: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
      change_type_enum: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
      update_status_enum: 'pending' | 'approved' | 'rejected'
    }
  }
}

// Convenience type exports
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

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

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type VerificationData = Database['public']['Tables']['verification_data']['Row']
export type VerificationDataInsert = Database['public']['Tables']['verification_data']['Insert']
export type VerificationDataUpdate = Database['public']['Tables']['verification_data']['Update']

export type CompanyChangeLog = Database['public']['Tables']['company_change_log']['Row']
export type CompanyChangeLogInsert = Database['public']['Tables']['company_change_log']['Insert']
export type CompanyChangeLogUpdate = Database['public']['Tables']['company_change_log']['Update']

export type PendingCompanyUpdate = Database['public']['Tables']['pending_company_updates']['Row']
export type PendingCompanyUpdateInsert = Database['public']['Tables']['pending_company_updates']['Insert']
export type PendingCompanyUpdateUpdate = Database['public']['Tables']['pending_company_updates']['Update']

// Extended company type with relations
export interface CompanyWithRelations extends Company {
  facilities?: Facility[]
  capabilities?: Capabilities[]
  industries?: Industry[]
  certifications?: Certification[]
  technical_specs?: TechnicalSpecs[]
  business_info?: BusinessInfo[]
  contacts?: Contact[]
  verification_data?: VerificationData | null
}

// Helper function for type-safe queries
export const createTypedClient = () => supabase