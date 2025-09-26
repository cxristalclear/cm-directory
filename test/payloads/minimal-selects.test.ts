import { sanitizeCompaniesForListing, computeFacetCountsFromCompanies } from "@/lib/payloads/listing"
import type {
  BusinessInfo,
  Capabilities,
  Certification,
  Company,
  Contact,
  Facility,
  Industry,
  TechnicalSpecs,
} from "@/types/company"

describe("listing page payloads", () => {
  const baseCompanies: Company[] = [
    {
      id: "c-1",
      company_name: "Alpha Manufacturing",
      slug: "alpha-manufacturing",
      dba_name: "Alpha",
      description: "Full-service EMS partner.",
      website_url: "https://alpha.test",
      year_founded: 1999,
      employee_count_range: "50-150",
      annual_revenue_range: "$10M-50M",
      logo_url: null,
      key_differentiators: null,
      is_active: true,
      is_verified: true,
      last_verified_date: null,
      created_at: undefined,
      updated_at: undefined,
      facilities: [
        {
          id: "f-1",
          company_id: "c-1",
          facility_type: "Manufacturing",
          street_address: "123 Main St",
          city: "San Jose",
          state: "CA",
          zip_code: "95112",
          country: "US",
          latitude: 37.3382,
          longitude: -121.8863,
          location: null,
          facility_size_sqft: null,
          employees_at_location: null,
          key_capabilities: null,
          is_primary: true,
          created_at: undefined,
          updated_at: undefined,
        } as Facility,
      ],
      capabilities: [
        {
          id: "cap-1",
          company_id: "c-1",
          pcb_assembly_smt: true,
          pcb_assembly_through_hole: true,
          pcb_assembly_mixed: null,
          pcb_assembly_fine_pitch: null,
          cable_harness_assembly: true,
          box_build_assembly: true,
          testing_ict: null,
          testing_functional: null,
          testing_environmental: null,
          testing_rf_wireless: null,
          design_services: null,
          supply_chain_management: null,
          prototyping: true,
          low_volume_production: true,
          medium_volume_production: false,
          high_volume_production: false,
          turnkey_services: null,
          consigned_services: null,
          last_verified_date: null,
          created_at: undefined,
          updated_at: undefined,
        } as Capabilities,
      ],
      industries: [
        {
          id: "ind-1",
          company_id: "c-1",
          industry_name: "Medical Devices",
          is_specialization: null,
          years_experience: null,
          notable_projects: null,
          created_at: undefined,
          updated_at: undefined,
        } as Industry,
      ],
      certifications: [
        {
          id: "cert-1",
          company_id: "c-1",
          certification_type: "ISO 13485",
          status: "Active",
          certificate_number: "ISO-13485-123",
          issued_date: null,
          expiration_date: null,
          issuing_body: null,
          scope: null,
          created_at: undefined,
          updated_at: undefined,
        } as Certification,
      ],
      technical_specs: [
        {
          id: "tech-1",
          company_id: "c-1",
          smallest_component_size: null,
          finest_pitch_capability: null,
          max_pcb_size_inches: null,
          max_pcb_layers: 8,
          lead_free_soldering: null,
          conformal_coating: null,
          potting_encapsulation: null,
          x_ray_inspection: null,
          aoi_inspection: null,
          flying_probe_testing: null,
          burn_in_testing: null,
          clean_room_class: null,
          additional_specs: null,
          created_at: undefined,
          updated_at: undefined,
        } as TechnicalSpecs,
      ],
      business_info: [
        {
          id: "biz-1",
          company_id: "c-1",
          min_order_qty: "100",
          prototype_lead_time: "2 weeks",
          production_lead_time: "6 weeks",
          payment_terms: "Net 30",
          rush_order_capability: null,
          twenty_four_seven_production: null,
          engineering_support_hours: null,
          sales_territory: null,
          notable_customers: null,
          awards_recognition: null,
          created_at: undefined,
          updated_at: undefined,
        } as BusinessInfo,
      ],
      contacts: [
        {
          id: "contact-1",
          company_id: "c-1",
          contact_type: "Primary",
          first_name: "Jane",
          last_name: "Doe",
          full_name: "Jane Doe",
          title: "Sales Director",
          email: "sales@alpha.test",
          phone: "555-111-2222",
          extension: null,
          is_primary: true,
          accepts_cold_outreach: null,
          preferred_contact_method: null,
          last_contacted: null,
          is_active: true,
          created_at: undefined,
          updated_at: undefined,
        } as Contact,
      ],
      verification_data: null,
    },
    {
      id: "c-2",
      company_name: "Beta Circuits",
      slug: "beta-circuits",
      dba_name: null,
      description: "Aerospace electronics specialist.",
      website_url: "https://beta.test",
      year_founded: 2005,
      employee_count_range: "150-500",
      annual_revenue_range: "$50M-150M",
      logo_url: null,
      key_differentiators: null,
      is_active: true,
      is_verified: true,
      last_verified_date: null,
      created_at: undefined,
      updated_at: undefined,
      facilities: [
        {
          id: "f-2",
          company_id: "c-2",
          facility_type: "Manufacturing",
          street_address: "500 Industrial Way",
          city: "Austin",
          state: "TX",
          zip_code: "73301",
          country: "US",
          latitude: 30.2672,
          longitude: -97.7431,
          location: null,
          facility_size_sqft: null,
          employees_at_location: null,
          key_capabilities: null,
          is_primary: true,
          created_at: undefined,
          updated_at: undefined,
        } as Facility,
      ],
      capabilities: [
        {
          id: "cap-2",
          company_id: "c-2",
          pcb_assembly_smt: true,
          pcb_assembly_through_hole: false,
          pcb_assembly_mixed: null,
          pcb_assembly_fine_pitch: true,
          cable_harness_assembly: false,
          box_build_assembly: true,
          testing_ict: null,
          testing_functional: null,
          testing_environmental: null,
          testing_rf_wireless: null,
          design_services: null,
          supply_chain_management: null,
          prototyping: true,
          low_volume_production: false,
          medium_volume_production: true,
          high_volume_production: true,
          turnkey_services: null,
          consigned_services: null,
          last_verified_date: null,
          created_at: undefined,
          updated_at: undefined,
        } as Capabilities,
      ],
      industries: [
        {
          id: "ind-2",
          company_id: "c-2",
          industry_name: "Aerospace",
          is_specialization: null,
          years_experience: null,
          notable_projects: null,
          created_at: undefined,
          updated_at: undefined,
        } as Industry,
      ],
      certifications: [
        {
          id: "cert-2",
          company_id: "c-2",
          certification_type: "AS9100",
          status: "Active",
          certificate_number: null,
          issued_date: null,
          expiration_date: null,
          issuing_body: null,
          scope: null,
          created_at: undefined,
          updated_at: undefined,
        } as Certification,
      ],
      technical_specs: [],
      business_info: [],
      contacts: [],
      verification_data: null,
    },
  ]

  const listingCompanies = sanitizeCompaniesForListing(baseCompanies)
  const facetCounts = computeFacetCountsFromCompanies(listingCompanies)
  const pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null,
    prevCursor: null,
    startCursor: null,
    endCursor: null,
    pageSize: listingCompanies.length,
  }

  function keyTree(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.reduce<Record<number, unknown>>((acc, item, index) => {
        acc[index] = keyTree(item)
        return acc
      }, {})
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.keys(value as Record<string, unknown>)
          .sort()
          .map((key) => [key, keyTree((value as Record<string, unknown>)[key])]),
      )
    }
    return typeof value
  }

  it("minimal-selects home page payload", () => {
    const homePayload = {
      companies: listingCompanies,
      facetCounts,
      filteredCount: listingCompanies.length,
      pageInfo,
    }

    expect(keyTree(homePayload)).toMatchInlineSnapshot(`
{
  "companies": {
    "0": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "string",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
    "1": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "object",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
  },
  "facetCounts": {
    "capabilities": {
      "0": {
        "count": "number",
        "slug": "string",
      },
      "1": {
        "count": "number",
        "slug": "string",
      },
      "2": {
        "count": "number",
        "slug": "string",
      },
      "3": {
        "count": "number",
        "slug": "string",
      },
      "4": {
        "count": "number",
        "slug": "string",
      },
      "5": {
        "count": "number",
        "slug": "string",
      },
      "6": {
        "count": "number",
        "slug": "string",
      },
    },
    "productionVolume": {
      "0": {
        "count": "number",
        "level": "string",
      },
      "1": {
        "count": "number",
        "level": "string",
      },
      "2": {
        "count": "number",
        "level": "string",
      },
    },
    "states": {
      "0": {
        "code": "string",
        "count": "number",
      },
      "1": {
        "code": "string",
        "count": "number",
      },
    },
  },
  "filteredCount": "number",
  "pageInfo": {
    "endCursor": "object",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean",
    "nextCursor": "object",
    "pageSize": "number",
    "prevCursor": "object",
    "startCursor": "object",
  },
}
`)

    const serialized = JSON.stringify(homePayload)
    expect(serialized).not.toContain("technical_specs")
    expect(serialized).not.toContain("business_info")
    expect(serialized).not.toContain("contacts")
  })

  it("minimal-selects state page payload", () => {
    const statePayload = {
      companies: listingCompanies,
      facetCounts,
      filteredCount: listingCompanies.length,
      pageInfo,
    }

    expect(keyTree(statePayload)).toMatchInlineSnapshot(`
{
  "companies": {
    "0": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "string",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
    "1": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "object",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
  },
  "facetCounts": {
    "capabilities": {
      "0": {
        "count": "number",
        "slug": "string",
      },
      "1": {
        "count": "number",
        "slug": "string",
      },
      "2": {
        "count": "number",
        "slug": "string",
      },
      "3": {
        "count": "number",
        "slug": "string",
      },
      "4": {
        "count": "number",
        "slug": "string",
      },
      "5": {
        "count": "number",
        "slug": "string",
      },
      "6": {
        "count": "number",
        "slug": "string",
      },
    },
    "productionVolume": {
      "0": {
        "count": "number",
        "level": "string",
      },
      "1": {
        "count": "number",
        "level": "string",
      },
      "2": {
        "count": "number",
        "level": "string",
      },
    },
    "states": {
      "0": {
        "code": "string",
        "count": "number",
      },
      "1": {
        "code": "string",
        "count": "number",
      },
    },
  },
  "filteredCount": "number",
  "pageInfo": {
    "endCursor": "object",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean",
    "nextCursor": "object",
    "pageSize": "number",
    "prevCursor": "object",
    "startCursor": "object",
  },
}
`)
  })

  it("minimal-selects certification page payload", () => {
    const certPayload = {
      companies: listingCompanies,
      facetCounts,
      filteredCount: listingCompanies.length,
      pageInfo,
    }

    expect(keyTree(certPayload)).toMatchInlineSnapshot(`
{
  "companies": {
    "0": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "string",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
    "1": {
      "annual_revenue_range": "string",
      "capabilities": {
        "0": {
          "box_build_assembly": "boolean",
          "cable_harness_assembly": "boolean",
          "high_volume_production": "boolean",
          "id": "string",
          "low_volume_production": "boolean",
          "medium_volume_production": "boolean",
          "pcb_assembly_fine_pitch": "boolean",
          "pcb_assembly_mixed": "boolean",
          "pcb_assembly_smt": "boolean",
          "pcb_assembly_through_hole": "boolean",
          "prototyping": "boolean",
        },
      },
      "certifications": {
        "0": {
          "certification_type": "string",
          "id": "string",
        },
      },
      "company_name": "string",
      "dba_name": "object",
      "description": "string",
      "employee_count_range": "string",
      "facilities": {
        "0": {
          "city": "string",
          "country": "string",
          "facility_type": "string",
          "id": "string",
          "is_primary": "boolean",
          "latitude": "number",
          "longitude": "number",
          "state": "string",
          "street_address": "string",
          "zip_code": "string",
        },
      },
      "id": "string",
      "industries": {
        "0": {
          "id": "string",
          "industry_name": "string",
        },
      },
      "slug": "string",
      "website_url": "string",
    },
  },
  "facetCounts": {
    "capabilities": {
      "0": {
        "count": "number",
        "slug": "string",
      },
      "1": {
        "count": "number",
        "slug": "string",
      },
      "2": {
        "count": "number",
        "slug": "string",
      },
      "3": {
        "count": "number",
        "slug": "string",
      },
      "4": {
        "count": "number",
        "slug": "string",
      },
      "5": {
        "count": "number",
        "slug": "string",
      },
      "6": {
        "count": "number",
        "slug": "string",
      },
    },
    "productionVolume": {
      "0": {
        "count": "number",
        "level": "string",
      },
      "1": {
        "count": "number",
        "level": "string",
      },
      "2": {
        "count": "number",
        "level": "string",
      },
    },
    "states": {
      "0": {
        "code": "string",
        "count": "number",
      },
      "1": {
        "code": "string",
        "count": "number",
      },
    },
  },
  "filteredCount": "number",
  "pageInfo": {
    "endCursor": "object",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean",
    "nextCursor": "object",
    "pageSize": "number",
    "prevCursor": "object",
    "startCursor": "object",
  },
}
`)
  })

  it("minimal-selects,no-client-recompute payload sanity", () => {
    expect(listingCompanies.length).toBe(2)
    expect(facetCounts.states.length).toBeGreaterThan(0)
  })
})
