// types/company.ts

export interface Facility {
  id: string;
  facility_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
}

export interface Capabilities {
  id: string;
  pcb_assembly_smt: boolean;
  pcb_assembly_through_hole: boolean;
  pcb_assembly_fine_pitch: boolean;
  cable_harness_assembly: boolean;
  box_build_assembly: boolean;
  prototyping: boolean;
  low_volume_production: boolean;
  medium_volume_production: boolean;
  high_volume_production: boolean;
  through_hole: boolean;
}

export interface Certification {
  id: string;
  certification_type: string;
  certification_number?: string;
  issued_date?: string;
  expiration_date?: string;
  status?: string;
}

export interface Industry {
  id: string;
  industry_name: string;
}

export interface Contact {
  id: string;
  contact_type: string;
  full_name?: string;
  title?: string;
  email?: string;
  phone?: string;
}

export interface BusinessInfo {
  id: string;
  min_order_qty?: string;
  prototype_lead_time?: string;
  production_lead_time?: string;
  payment_terms?: string;
}

export interface TechnicalSpec {
  id: string;
  min_pcb_trace_width?: string;
  max_pcb_layers?: number;
  max_board_size?: string;
  smt_placement_accuracy?: string;
}

export interface Company {
  id: string;
  slug: string;
  company_name: string;
  dba_name?: string;
  description?: string;
  key_differentiators?: string;
  employee_count_range: string;
  year_founded?: number;
  annual_revenue_range?: string;
  website_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  facilities?: Facility[];
  capabilities?: Capabilities[];
  certifications?: Certification[];
  industries?: Industry[];
  contacts?: Contact[];
  business_info?: BusinessInfo[];
  technical_specs?: TechnicalSpec[];
}

export interface FacilityWithCompany extends Facility {
  company: Company;
}

export interface FilterState {
  searchTerm: string;
  countries: string[];
  states: string[];
  capabilities: string[];
  certifications: string[];
  industries: string[];
  employeeRange: string[];
  volumeCapability: string[];
}

export interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  filteredCount: number;
  setFilteredCount: (count: number) => void;
  isPending: boolean;
}