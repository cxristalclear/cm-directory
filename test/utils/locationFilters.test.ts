import type { HomepageFacility } from "@/types/homepage"
import { getFacilityLocationLabel } from "@/utils/locationFilters"

const buildFacility = (overrides: Partial<HomepageFacility> = {}): HomepageFacility => ({
  id: overrides.id ?? "facility-1",
  company_id: overrides.company_id ?? "company-1",
  facility_type: overrides.facility_type ?? "Manufacturing",
  city: overrides.city ?? null,
  state: overrides.state ?? null,
  state_code: overrides.state_code ?? null,
  state_province: overrides.state_province ?? null,
  country: overrides.country ?? null,
  country_code: overrides.country_code ?? null,
  latitude: overrides.latitude ?? null,
  longitude: overrides.longitude ?? null,
  postal_code: overrides.postal_code ?? null,
  street_address: overrides.street_address ?? null,
  zip_code: overrides.zip_code ?? null,
  location: overrides.location ?? null,
  is_primary: overrides.is_primary ?? false,
  created_at: overrides.created_at ?? new Date().toISOString(),
  updated_at: overrides.updated_at ?? new Date().toISOString(),
  employees_at_location: overrides.employees_at_location ?? null,
  facility_name: overrides.facility_name ?? null,
  facility_size_sqft: overrides.facility_size_sqft ?? null,
  key_capabilities: overrides.key_capabilities ?? null,
}) as HomepageFacility

describe("getFacilityLocationLabel", () => {
  it("returns city, state label, and country label when available", () => {
    const facility = buildFacility({
      city: "Austin",
      state_code: "TX",
      country_code: "US",
    })

    expect(getFacilityLocationLabel(facility)).toBe("Austin, Texas, United States")
  })

  it("falls back to provided country name when no code exists", () => {
    const facility = buildFacility({
      city: "Munich",
      country: "Germany",
    })

    expect(getFacilityLocationLabel(facility)).toBe("Munich, Germany")
  })

  it("returns 'Multiple' when no facility data or location fields exist", () => {
    expect(getFacilityLocationLabel()).toBe("Multiple")
    const emptyFacility = buildFacility()
    expect(getFacilityLocationLabel(emptyFacility)).toBe("Multiple")
  })
})
