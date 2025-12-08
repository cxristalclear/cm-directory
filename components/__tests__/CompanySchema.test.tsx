import { renderToStaticMarkup } from 'react-dom/server'
import { CompanySchema } from '@/components/CompanySchema'
import type { CompanyWithRelations } from '@/types/company'

describe('CompanySchema', () => {
  const buildCompany = (overrides: Partial<CompanyWithRelations> = {}): CompanyWithRelations => {
    const base = {
      id: 'company-1',
      company_name: 'Acme Manufacturing',
      website_url: 'https://acme.example.com',
      year_founded: 1984,
      employee_count_range: '50-150',
      annual_revenue_range: null,
      slug: 'acme-manufacturing',
      logo_url: 'https://cdn.example.com/acme-logo.png',
      description: 'Precision electronics manufacturing.',
      key_differentiators: null,
      is_active: true,
      is_verified: true,
      last_verified_date: null,
      created_at: null,
      updated_at: null,
      claim_status: null,
      claimed_at: null,
      claimed_by_email: null,
      claimed_by_name: null,
      claim_approved_at: null,
      claim_approved_by: null,
      claim_rejection_reason: null,
      verified_at: null,
      verified_by: null,
      verified_until: null,
      has_pending_updates: null,
      contacts: [
        {
          id: 'contact-1',
          company_id: 'company-1',
          contact_type: 'Sales',
          first_name: 'Pat',
          last_name: 'Doe',
          full_name: 'Pat Doe',
          title: 'Sales Manager',
          email: 'sales@acme.example.com',
          phone: '+1-555-0100',
          extension: null,
          is_primary: true,
          is_active: true,
          accepts_cold_outreach: null,
          preferred_contact_method: null,
          last_contacted: null,
          created_at: null,
          updated_at: null,
        },
      ],
      business_info: null,
      technical_specs: null,
      verification_data: {
        id: 'verification-1',
        company_id: 'company-1',
        verified_by: null,
        verification_date: null,
        verification_method: null,
        data_confidence: null,
        venkel_relationship: null,
        recommended_by: null,
        internal_notes: null,
        public_description: null,
        is_featured_partner: null,
        has_logo: true,
        profile_completeness: null,
        created_at: null,
        updated_at: null,
      },
      facilities: [
        {
          id: 'facility-1',
          company_id: 'company-1',
          facility_type: 'HQ',
          street_address: '123 Market Street',
          city: 'San Jose',
          state: 'CA',
          state_province: 'California',
          state_code: 'CA',
          postal_code: '94088',
          zip_code: '94088',
          country: 'United States',
          country_code: 'US',
          latitude: null,
          longitude: null,
          location: null,
          facility_name: null,
          facility_size_sqft: null,
          employees_at_location: null,
          key_capabilities: null,
          is_primary: true,
          created_at: null,
          updated_at: null,
        },
      ],
      capabilities: [
        {
          id: 'cap-1',
          company_id: 'company-1',
          pcb_assembly_smt: true,
          pcb_assembly_through_hole: true,
          pcb_assembly_mixed: null,
          pcb_assembly_fine_pitch: false,
          cable_harness_assembly: true,
          box_build_assembly: false,
          testing_ict: null,
          testing_functional: null,
          testing_environmental: null,
          testing_rf_wireless: null,
          design_services: null,
          supply_chain_management: null,
          prototyping: true,
          low_volume_production: true,
          medium_volume_production: false,
          high_volume_production: null,
          turnkey_services: null,
          consigned_services: null,
          lead_free_soldering: null,
          last_verified_date: null,
          created_at: null,
          updated_at: null,
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          company_id: 'company-1',
          certification_type: 'ISO 9001',
          status: 'Active',
          certificate_number: null,
          issued_date: '2020-01-01',
          expiration_date: '2025-01-01',
          issuing_body: null,
          scope: null,
          created_at: null,
          updated_at: null,
        },
      ],
      industries: [
        {
          id: 'industry-1',
          company_id: 'company-1',
          industry_name: 'Aerospace',
          is_specialization: null,
          years_experience: null,
          notable_projects: null,
          created_at: null,
          updated_at: null,
        },
      ],
      cms_metadata: {
        canonical_path: '/companies/acme-manufacturing',
        social_links: [
          {
            platform: 'linkedin',
            url: 'https://www.linkedin.com/company/acme',
            is_verified: true,
          },
          {
            platform: 'facebook',
            url: 'https://www.facebook.com/acme',
            is_verified: false,
          },
        ],
        logo: {
          url: 'https://cdn.example.com/acme-logo.svg',
          alt_text: 'Acme Manufacturing logo',
        },
        hero_image: {
          url: 'https://cdn.example.com/acme-hero.jpg',
          alt_text: 'Acme manufacturing floor',
        },
        gallery_images: [
          {
            url: 'https://cdn.example.com/acme-facility.jpg',
          },
        ],
      },
      social_links: [
        {
          platform: 'twitter',
          url: 'https://twitter.com/acme',
          is_verified: true,
        },
      ],
    } satisfies Partial<CompanyWithRelations>

    return {
      ...base,
      ...overrides,
    } as CompanyWithRelations
  }

  it('emits canonical identifiers, verified profiles, and media assets', () => {
    const markup = renderToStaticMarkup(<CompanySchema company={buildCompany()} />)
    const scriptContent = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('<'))
    const schema = JSON.parse(scriptContent)

    expect(schema['@id']).toBe('https://www.pcbafinder.com/companies/acme-manufacturing')
    expect(schema.url).toBe('https://www.pcbafinder.com/companies/acme-manufacturing')
    expect(schema.sameAs).toEqual([
      'https://acme.example.com',
      'https://www.linkedin.com/company/acme',
      'https://twitter.com/acme',
    ])
    expect(schema.logo).toBe('https://cdn.example.com/acme-logo.svg')
    expect(schema.image).toEqual([
      'https://cdn.example.com/acme-hero.jpg',
      'https://cdn.example.com/acme-facility.jpg',
      'https://cdn.example.com/acme-logo.svg',
    ])
    expect(scriptContent).not.toContain('undefined')
  })

  it('omits optional fields when source data is absent', () => {
    const company = buildCompany({
      cms_metadata: null,
      social_links: null,
      logo_url: null,
      facilities: [],
      contacts: [],
      capabilities: [],
      certifications: [],
      industries: [],
    })

    const markup = renderToStaticMarkup(
      <CompanySchema
        company={company}
        canonicalUrl="/companies/minimal-manufacturer"
      />
    )

    const scriptContent = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('<'))
    const schema = JSON.parse(scriptContent)

    expect(schema['@id']).toBe('https://www.pcbafinder.com/companies/minimal-manufacturer')
    expect(schema.sameAs).toEqual(['https://acme.example.com'])
    expect(schema.logo).toBeUndefined()
    expect(schema.image).toBeUndefined()
    expect(schema.address).toBeUndefined()
    expect(schema.contactPoint).toBeUndefined()
    expect(schema.hasCredential).toBeUndefined()
    expect(schema.areaServed).toBeUndefined()
  })
})
