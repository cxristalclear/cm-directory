// Admin-specific types for forms

export interface CompanyFormData {
  // Basic Info
  company_name: string
  dba_name?: string | null
  description?: string | null
  website_url?: string
  year_founded?: number | null
  employee_count_range?: string | null
  annual_revenue_range?: string | null
  key_differentiators?: string | null

  is_verified?: boolean | null
  verified_until?: string | null

  // Related data
  facilities?: FacilityFormData[]
  capabilities?: CapabilitiesFormData
  industries?: IndustryFormData[]
  certifications?: CertificationFormData[]
  technical_specs?: TechnicalSpecsFormData
  business_info?: BusinessInfoFormData
}

export interface FacilityFormData {
  id?: string
  facility_type: string
  street_address?: string | null
  city?: string | null
  /**
   * @deprecated Legacy field retained for read-only fallbacks.
   */
  state?: string | null
  state_code?: string | null
  state_province?: string | null
  postal_code?: string | null
  /**
   * @deprecated Legacy field retained for read-only fallbacks.
   */
  zip_code?: string | null
  country?: string | null
  country_code?: string | null
  is_primary?: boolean
  latitude?: number | null
  longitude?: number | null
  location?: unknown | null
}

export interface CapabilitiesFormData {
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
}

export interface IndustryFormData {
  id?: string
  industry_name: string
}

export interface CertificationFormData {
  id?: string
  certification_type: string
  certificate_number?: string | null
  status?: 'Active' | 'Expired' | 'Pending' | null
  issued_date?: string | null
  expiration_date?: string | null
}

export interface TechnicalSpecsFormData {
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
}

export interface BusinessInfoFormData {
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
}
