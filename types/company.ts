import type { Dispatch, SetStateAction } from "react"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type { Database } from "@/lib/database.types"
import type {
  BusinessInfo as DBBusinessInfo,
  Capabilities as DBCapabilities,
  Certification as DBCertification,
  Company as DBCompany,
  Contact as DBContact,
  Facility as DBFacility,
  Industry as DBIndustry,
  TechnicalSpecs as DBTechnicalSpecs,
} from "@/lib/supabase"

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

export type SocialPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "twitter"
  | "x"
  | "youtube"
  | "tiktok"
  | "github"
  | "glassdoor"
  | "crunchbase"
  | "pinterest"
  | "yelp"
  | "other"
  | string

export interface CompanySocialLink {
  platform: SocialPlatform
  url: string
  is_verified?: boolean | null
  verified?: boolean | null
}

export interface CompanyMediaAsset {
  url: string
  alt_text?: string | null
  caption?: string | null
  type?: "logo" | "hero" | "gallery" | string | null
}

export interface CompanyCmsMetadata {
  canonical_path?: string | null
  logo?: CompanyMediaAsset | null
  hero_image?: CompanyMediaAsset | null
  gallery_images?: CompanyMediaAsset[] | null
  social_links?: CompanySocialLink[] | null
}

export type Facility = DBFacility
export type Capabilities = DBCapabilities
export type Industry = DBIndustry
export type Certification = DBCertification
export type TechnicalSpecs = DBTechnicalSpecs
export type BusinessInfo = DBBusinessInfo
export type Contact = DBContact
export type VerificationData = Database["public"]["Tables"]["verification_data"]["Row"]

type CompanyBase = DBCompany & {
  cms_metadata?: CompanyCmsMetadata | null
  social_links?: CompanySocialLink[] | null
}

type CompanyRelations = {
  facilities?: Facility[] | null
  capabilities?: Capabilities[] | null
  industries?: Industry[] | null
  certifications?: Certification[] | null
  technical_specs?: TechnicalSpecs[] | null
  business_info?: BusinessInfo[] | null
  contacts?: Contact[] | null
  verification_data?: VerificationData | null
}

export type Company = CompanyBase & CompanyRelations
export type CompanyWithRelations = Company

export interface FacilityWithCompany extends Facility {
  company: Company
}

export const EmployeeCountRanges = ["<50", "50-150", "150-500", "500-1000", "1000+"] as const
export const RevenueRanges = ["<$10M", "$10M-50M", "$50M-150M", "$150M+"] as const
export const FacilityTypes = ["HQ", "Manufacturing", "Engineering", "Sales Office"] as const
export const CertificationStatus = ["Active", "Expired", "Pending"] as const
export const ContactTypes = ["Primary", "Sales", "Engineering", "General"] as const
export const DataConfidenceLevels = ["High", "Medium", "Low"] as const

export function isValidCompany(obj: unknown): obj is Company {
  const company = obj as Record<string, unknown>
  return Boolean(
    company &&
    typeof company.company_name === "string" &&
    typeof company.slug === "string"
  )
}

export function hasCapabilities(company: Company): boolean {
  return Boolean(company.capabilities && company.capabilities.length > 0)
}

export function hasCertifications(company: Company): boolean {
  return Boolean(company.certifications && company.certifications.length > 0)
}