import type { Database } from "@/lib/database.types"

export type HomepageFacility = Database["public"]["Tables"]["facilities"]["Row"]
export type HomepageCapability = Database["public"]["Tables"]["capabilities"]["Row"]
export type HomepageCertification = Database["public"]["Tables"]["certifications"]["Row"]
export type HomepageIndustry = Database["public"]["Tables"]["industries"]["Row"]

export type HomepageCompany = Database["public"]["Tables"]["companies"]["Row"] & {
  facilities: HomepageFacility[] | null
  capabilities: HomepageCapability[] | null
  certifications: HomepageCertification[] | null
  industries: HomepageIndustry[] | null
}

export type HomepageFacilityWithCompany = HomepageFacility & {
  company: HomepageCompany
}
