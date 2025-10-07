// Admin-specific types for forms

export interface CompanyFormData {
  // Basic Info
  company_name: string
  dba_name?: string
  description?: string
  website_url?: string
  year_founded?: number
  employee_count_range?: string
  annual_revenue_range?: string
  key_differentiators?: string

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
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  is_primary?: boolean
}

export interface CapabilitiesFormData {
  pcb_assembly_smt?: boolean
  pcb_assembly_through_hole?: boolean
  pcb_assembly_mixed?: boolean
  pcb_assembly_fine_pitch?: boolean
  cable_harness_assembly?: boolean
  box_build_assembly?: boolean
  testing_ict?: boolean
  testing_functional?: boolean
  testing_environmental?: boolean
  testing_rf_wireless?: boolean
  design_services?: boolean
  supply_chain_management?: boolean
  prototyping?: boolean
  low_volume_production?: boolean
  medium_volume_production?: boolean
  high_volume_production?: boolean
  turnkey_services?: boolean
  consigned_services?: boolean
}

export interface IndustryFormData {
  id?: string
  industry_name: string
}

export interface CertificationFormData {
  id?: string
  certification_type: string
  certificate_number?: string
  status?: 'Active' | 'Expired' | 'Pending'
  issued_date?: string
  expiration_date?: string
}

export interface TechnicalSpecsFormData {
  smallest_component_size?: string
  finest_pitch_capability?: string
  max_pcb_size_inches?: string
  max_pcb_layers?: number
  lead_free_soldering?: boolean
  conformal_coating?: boolean
  potting_encapsulation?: boolean
  x_ray_inspection?: boolean
  aoi_inspection?: boolean
  flying_probe_testing?: boolean
  burn_in_testing?: boolean
  clean_room_class?: string
}

export interface BusinessInfoFormData {
  min_order_qty?: string
  prototype_lead_time?: string
  production_lead_time?: string
  payment_terms?: string
  rush_order_capability?: boolean
  twenty_four_seven_production?: boolean
  engineering_support_hours?: string
  sales_territory?: string
  notable_customers?: string
  awards_recognition?: string
}