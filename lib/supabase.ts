// Updated supabase.ts with claim, verification, and version history types
// This extends your existing types with the new columns and tables

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          // Existing fields
          id: string
          name: string
          slug: string
          description: string | null
          website: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          industry: string | null
          services: string[] | null
          certifications: string[] | null
          created_at: string
          updated_at: string
          
          // NEW: Claim tracking fields
          claim_status: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email: string | null
          claimed_by_name: string | null
          claimed_at: string | null
          claim_approved_by: string | null
          claim_approved_at: string | null
          claim_rejection_reason: string | null
          
          // NEW: Verification badge fields (5-year validity)
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          verified_until: string | null
          
          // NEW: Update tracking fields
          has_pending_updates: boolean
          last_reviewed_at: string | null
          last_reviewed_by: string | null
        }
        Insert: {
          // Existing fields
          id?: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          industry?: string | null
          services?: string[] | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
          
          // NEW: Claim tracking
          claim_status?: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          claimed_at?: string | null
          claim_approved_by?: string | null
          claim_approved_at?: string | null
          claim_rejection_reason?: string | null
          
          // NEW: Verification
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          verified_until?: string | null
          
          // NEW: Updates
          has_pending_updates?: boolean
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
        }
        Update: {
          // Existing fields
          id?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          industry?: string | null
          services?: string[] | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
          
          // NEW: Claim tracking
          claim_status?: 'unclaimed' | 'pending_review' | 'claimed' | 'rejected'
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          claimed_at?: string | null
          claim_approved_by?: string | null
          claim_approved_at?: string | null
          claim_rejection_reason?: string | null
          
          // NEW: Verification
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          verified_until?: string | null
          
          // NEW: Updates
          has_pending_updates?: boolean
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
        }
      }
      
      // NEW: Version history table
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
          change_summary: Record<string, unknown> | null
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
          change_summary?: Record<string, unknown> | null
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
          change_summary?: Record<string, unknown> | null
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      
      // NEW: Pending updates table
      pending_company_updates: {
        Row: {
          id: string
          company_id: string
          submitted_by_email: string
          submitted_by_name: string
          submitted_at: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          proposed_changes: Record<string, unknown>
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
          proposed_changes: Record<string, unknown>
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
          proposed_changes?: Record<string, unknown>
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper type exports for easier usage
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type CompanyChangeLog = Database['public']['Tables']['company_change_log']['Row']
export type CompanyChangeLogInsert = Database['public']['Tables']['company_change_log']['Insert']

export type PendingCompanyUpdate = Database['public']['Tables']['pending_company_updates']['Row']
export type PendingCompanyUpdateInsert = Database['public']['Tables']['pending_company_updates']['Insert']