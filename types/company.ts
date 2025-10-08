import type { Dispatch, SetStateAction } from "react"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"

// Database-accurate type definitions based on your PostgreSQL schema

export type FilterState = {
  countries: string[]
  states: string[]
  capabilities: CapabilitySlug[]
  productionVolume: ProductionVolume | null
}

export type FilterContextType = {
  filters: FilterState
  setFilters: Dispatch<SetStateAction<FilterState>>
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  filteredCount: number
  setFilteredCount: Dispatch<SetStateAction<number>>
  isPending: boolean
}

export interface Company {
  // ❌ REMOVED: name: string (doesn't exist in DB)
  
  // Primary fields
  id: string
  company_name: string
  dba_name?: string | null
  website_url: string // ✅ Changed to required (matches DB)
  year_founded?: number | null
  employee_count_range?: string | null
  annual_revenue_range?: string | null
  slug: string | null // ✅ Changed to nullable
  logo_url?: string | null
  description?: string | null
  key_differentiators?: string | null
  
  // Metadata
  is_active?: boolean | null
  is_verified?: boolean | null
  last_verified_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  
  // ✅ ADDED: Claim management fields
  claim_status?: string | null
  claimed_at?: string | null
  claimed_by_email?: string | null
  claimed_by_name?: string | null
  claim_approved_at?: string | null
  claim_approved_by?: string | null
  claim_rejection_reason?: string | null
  
  // ✅ ADDED: Verification tracking
  verified_at?: string | null
  verified_by?: string | null
  verified_until?: string | null
  
  // ✅ ADDED: Review tracking
  last_reviewed_at?: string | null
  last_reviewed_by?: string | null
  has_pending_updates?: boolean | null
  
  // Relationships
  facilities?: Facility[] | null
  capabilities?: Capabilities[] | null
  industries?: Industry[] | null
  certifications?: Certification[] | null
  technical_specs?: TechnicalSpecs[] | null
  business_info?: BusinessInfo[] | null
  contacts?: Contact[] | null
  verification_data?: VerificationData | null
}

// Extended Company type with all relations (used for detailed pages)
export interface CompanyWithRelations extends Company {
  contacts?: Contact[]
  business_info?: BusinessInfo[]
  technical_specs?: TechnicalSpecs[]
  facilities?: Facility[]
  capabilities?: Capabilities[]
  certifications?: Certification[]
  industries?: Industry[]
}

export interface Facility {
  id: string
  company_id: string
  facility_type: string
  street_address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  
  // GIS data
  latitude?: number | null
  longitude?: number | null
  location?: {
    type: 'Point'
    coordinates: [number, number]
  } | null
  
  // Facility details
  facility_name?: string | null // ✅ ADDED - exists in DB
  facility_size_sqft?: number | null
  employees_at_location?: number | null
  key_capabilities?: string | null
  
  // Metadata
  is_primary?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Capabilities {
  id: string
  company_id: string
  
  // PCB Assembly
  pcb_assembly_smt?: boolean | null
  pcb_assembly_through_hole?: boolean | null
  pcb_assembly_mixed?: boolean | null
  pcb_assembly_fine_pitch?: boolean | null
  
  // Other Manufacturing
  cable_harness_assembly?: boolean | null
  box_build_assembly?: boolean | null
  
  // Testing
  testing_ict?: boolean | null
  testing_functional?: boolean | null
  testing_environmental?: boolean | null
  testing_rf_wireless?: boolean | null
  
  // Services
  design_services?: boolean | null
  supply_chain_management?: boolean | null
  prototyping?: boolean | null
  
  // Volume
  low_volume_production?: boolean | null
  medium_volume_production?: boolean | null
  high_volume_production?: boolean | null
  
  // Service Models
  turnkey_services?: boolean | null
  consigned_services?: boolean | null
  
  // ✅ ADDED: This exists in capabilities table
  lead_free_soldering?: boolean | null
  
  // Metadata
  last_verified_date?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Industry {
  id: string
  company_id: string
  industry_name: string
  is_specialization?: boolean | null
  years_experience?: number | null
  notable_projects?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Certification {
  id: string
  company_id: string
  certification_type: string
  status?: string | null
  certificate_number?: string | null
  issued_date?: string | null
  expiration_date?: string | null
  issuing_body?: string | null
  scope?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface TechnicalSpecs {
  id: string
  company_id: string
  
  // Component Capabilities
  smallest_component_size?: string | null
  finest_pitch_capability?: string | null
  max_pcb_size_inches?: string | null
  max_pcb_layers?: number | null
  
  // Process Capabilities
  lead_free_soldering?: boolean | null // Also in Capabilities table
  conformal_coating?: boolean | null
  potting_encapsulation?: boolean | null
  
  // Inspection/Testing
  x_ray_inspection?: boolean | null
  aoi_inspection?: boolean | null
  flying_probe_testing?: boolean | null
  burn_in_testing?: boolean | null
  
  // Facility
  clean_room_class?: string | null
  
  // Additional
  additional_specs?: string | null // ✅ Changed from Record to string (DB type)
  
  created_at?: string | null
  updated_at?: string | null
}

export interface BusinessInfo {
  id: string
  company_id: string
  
  // Order Information
  min_order_qty?: string | null
  prototype_lead_time?: string | null
  production_lead_time?: string | null
  
  // Business Terms
  payment_terms?: string | null
  rush_order_capability?: boolean | null
  twenty_four_seven_production?: boolean | null
  
  // Support
  engineering_support_hours?: string | null
  sales_territory?: string | null
  
  // Recognition
  notable_customers?: string | null
  awards_recognition?: string | null
  
  created_at?: string | null
  updated_at?: string | null
}

export interface Contact {
  id: string
  company_id: string
  contact_type: string
  
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  title?: string | null
  email?: string | null
  phone?: string | null
  extension?: string | null
  
  // Preferences
  is_primary?: boolean | null
  is_active?: boolean | null
  accepts_cold_outreach?: boolean | null
  preferred_contact_method?: string | null
  
  // Metadata
  last_contacted?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface VerificationData {
  id: string
  company_id: string
  
  // Verification Details
  verified_by?: string | null
  verification_date?: string | null
  verification_method?: string | null
  data_confidence?: string | null
  
  // Relationship
  venkel_relationship?: string | null
  recommended_by?: string | null
  
  // Notes
  internal_notes?: string | null
  public_description?: string | null
  
  // Status
  is_featured_partner?: boolean | null
  has_logo?: boolean | null
  profile_completeness?: number | null
  
  created_at?: string | null
  updated_at?: string | null
}

export interface FacilityWithCompany extends Facility {
  company: Company
}

// Enum types for validation
export const EmployeeCountRanges = ['<50', '50-150', '150-500', '500-1000', '1000+'] as const
export const RevenueRanges = ['<$10M', '$10M-50M', '$50M-150M', '$150M+'] as const
export const FacilityTypes = ['HQ', 'Manufacturing', 'Engineering', 'Sales Office'] as const
export const CertificationStatus = ['Active', 'Expired', 'Pending'] as const
export const ContactTypes = ['Primary', 'Sales', 'Engineering', 'General'] as const
export const DataConfidenceLevels = ['High', 'Medium', 'Low'] as const

// Type guards
export function isValidCompany(obj: unknown): obj is Company {
  const company = obj as Record<string, unknown>
  return Boolean(
    company && 
    typeof company.company_name === 'string' && 
    typeof company.slug === 'string'
  )
}

export function hasCapabilities(company: Company): boolean {
  return Boolean(company.capabilities && company.capabilities.length > 0)
}

export function hasCertifications(company: Company): boolean {
  return Boolean(company.certifications && company.certifications.length > 0)
}