import type { Database } from "@/lib/database.types"
import type { HomepageCompany as CompanyType } from "@/types/company"

export type HomepageFacility = Database["public"]["Tables"]["facilities"]["Row"]
export type HomepageCapability = Database["public"]["Tables"]["capabilities"]["Row"]
export type HomepageCertification = Database["public"]["Tables"]["certifications"]["Row"]
export type HomepageIndustry = Database["public"]["Tables"]["industries"]["Row"]

export type HomepageCompany = CompanyType

export type HomepageFacilityLocation = Pick<
  HomepageFacility,
  | "id"
  | "company_id"
  | "city"
  | "state"
  | "state_code"
  | "state_province"
  | "country"
  | "country_code"
  | "latitude"
  | "longitude"
  | "facility_type"
  | "is_primary"
>

export type HomepageCompanyWithLocations = Omit<HomepageCompany, "facilities"> & {
  facilities?: HomepageFacilityLocation[] | null
}

export type HomepageFacilityWithCompany = HomepageFacilityLocation & {
  company: HomepageCompanyWithLocations
}
