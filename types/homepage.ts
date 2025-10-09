import type { Database } from "@/lib/database.types"
import type { HomepageCompany as CompanyType } from "@/types/company"

export type HomepageFacility = Database["public"]["Tables"]["facilities"]["Row"]
export type HomepageCapability = Database["public"]["Tables"]["capabilities"]["Row"]
export type HomepageCertification = Database["public"]["Tables"]["certifications"]["Row"]
export type HomepageIndustry = Database["public"]["Tables"]["industries"]["Row"]

export type HomepageCompany = CompanyType

export type HomepageFacilityWithCompany = HomepageFacility & {
  company: HomepageCompany
}
