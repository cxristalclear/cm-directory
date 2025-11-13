import type { HomepageFacility } from "@/types/homepage"
import { getFacilityLocationLabel } from "@/utils/locationFilters"

const buildFacility = (overrides: Partial<HomepageFacility> = {}): HomepageFacility =>
  ({
    id: overrides.id ?? "facility-1",
    company_id: overrides.company_id ?? "company-1",
    created_at: overrides.created_at ?? new Date().toISOString(),
    updated_at: overrides.updated_at ?? new Date().toISOString(),
    facility_type: overrides.facility_type ?? "Manufacturing",
    city: overrides.city ?? null,
    state: overrides.state ?? null,
    state_code: overrides.state_code ?? null,
    state_province: overrides.state_province ?? null,
    country: overrides.country ?? null,
    country_code: overrides.country_code ?? null,
    postal_code: overrides.postal_code ?? null,
    zip_code: overrides.zip_code ?? null,
    street_address: overrides.street_address ?? null,
    latitude: overrides.latitude ?? null,
    longitude: overrides.longitude ?? null,
    location: overrides.location ?? null,
    is_primary: overrides.is_primary ?? false,
    name: overrides.name ?? null,
    created_by: overrides.created_by ?? null,
    updated_by: overrides.updated_by ?? null,
    phone: overrides.phone ?? null,
    email: overrides.email ?? null,
    website: overrides.website ?? null,
    facility_size_sq_ft: overrides.facility_size_sq_ft ?? null,
    capacity_notes: overrides.capacity_notes ?? null,
    certifications: overrides.certifications ?? null,
    notes: overrides.notes ?? null,
  } as unknown as HomepageFacility)

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
