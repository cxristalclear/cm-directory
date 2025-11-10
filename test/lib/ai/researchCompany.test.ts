import { researchCompany, snapshotMatchesRequest } from '@/lib/ai/researchCompany'
import { callOpenAI } from '@/lib/ai/openaiClient'
import { enrichCompanyData, formatEnrichmentData } from '@/lib/ai/zoomInfoEnrich'

jest.mock('@/lib/ai/openaiClient', () => ({
  callOpenAI: jest.fn(),
}))

jest.mock('@/lib/ai/zoomInfoEnrich', () => ({
  enrichCompanyData: jest.fn(),
  formatEnrichmentData: jest.fn(),
}))

const mockedCallOpenAI = callOpenAI as jest.MockedFunction<typeof callOpenAI>
const mockedEnrichCompanyData = enrichCompanyData as jest.MockedFunction<typeof enrichCompanyData>
const mockedFormatEnrichmentData = formatEnrichmentData as jest.MockedFunction<
  typeof formatEnrichmentData
>

describe('researchCompany data normalization', () => {
  let warnSpy: jest.SpyInstance
  let logSpy: jest.SpyInstance

  beforeEach(() => {
    jest.resetAllMocks()
    mockedEnrichCompanyData.mockResolvedValue({
      success: true,
      data: undefined,
    })
    mockedFormatEnrichmentData.mockReturnValue('Mock enrichment')
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    logSpy.mockRestore()
  })

  it('normalizes facilities, capabilities, certifications, specs, and business info from varied AI payloads', async () => {
    mockedCallOpenAI.mockResolvedValueOnce(
      JSON.stringify({
        company_name: 'Acme Manufacturing',
        website: 'https://acme.com',
        facilities: [
          {
            facility_type: 'HQ',
            address: '123 Main St',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            latitude: '30.25',
            longitude: '-97.75',
            is_primary: 'yes',
          },
        ],
        capabilities: ['SMT PCB Assembly', 'Functional Testing', 'Turnkey Services'],
        industries: ['Medical Devices', { industry_name: 'Aerospace' }],
        certifications: ['ISO 9001', { certification_type: 'AS9100', status: 'Pending' }],
        technical_specs: {
          max_pcb_layers: '12',
          lead_free_soldering: 'true',
          clean_room_class: 'ISO Class 7',
        },
        business_info: {
          rush_orders: 'yes',
          twentyfour_seven: 'no',
          payment_terms: 'Net 30',
          notable_customers: 'SpaceX',
          awards: 'Best Supplier 2024',
        },
      })
    )

    const result = await researchCompany('Acme Manufacturing', 'https://acme.com')

    expect(result.success).toBe(true)
    const data = result.data
    expect(data).toBeDefined()
    expect(data?.facilities).toHaveLength(1)
    expect(data?.facilities?.[0]).toMatchObject({
      facility_type: 'HQ',
      street_address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip_code: '78701',
      country: 'US',
      is_primary: true,
      latitude: 30.25,
      longitude: -97.75,
    })

    expect(data?.capabilities).toMatchObject({
      pcb_assembly_smt: true,
      testing_functional: true,
      turnkey_services: true,
    })

    expect(data?.industries).toEqual([
      { industry_name: 'Medical Devices' },
      { industry_name: 'Aerospace' },
    ])

    expect(data?.certifications).toEqual([
      {
        certification_type: 'ISO 9001',
        certificate_number: undefined,
        status: 'Active',
        issued_date: undefined,
        expiration_date: undefined,
      },
      {
        certification_type: 'AS9100',
        certificate_number: undefined,
        status: 'Pending',
        issued_date: undefined,
        expiration_date: undefined,
      },
    ])

    expect(data?.technical_specs).toMatchObject({
      max_pcb_layers: 12,
      lead_free_soldering: true,
      clean_room_class: 'ISO Class 7',
    })

    expect(data?.business_info).toMatchObject({
      payment_terms: 'Net 30',
      rush_order_capability: true,
      twenty_four_seven_production: false,
      notable_customers: 'SpaceX',
      awards_recognition: 'Best Supplier 2024',
    })
  })

  it('falls back to top-level notable customers and awards when missing from business info', async () => {
    mockedCallOpenAI.mockResolvedValueOnce(
      JSON.stringify({
        company_name: 'Fallback Industries',
        notable_customers: 'NASA',
        awards: 'Quality Award',
        facilities: [{ city: 'Denver', state: 'CO', street: '1 Innovation Way' }],
        business_info: {},
      })
    )

    const result = await researchCompany('Fallback Industries')

    expect(result.success).toBe(true)
    const data = result.data
    expect(data?.business_info?.notable_customers).toBe('NASA')
    expect(data?.business_info?.awards_recognition).toBe('Quality Award')
    expect(data?.facilities).toHaveLength(1)
    expect(data?.facilities?.[0]).toMatchObject({
      street_address: '1 Innovation Way',
      city: 'Denver',
      state: 'CO',
    })
  })
})

describe('snapshotMatchesRequest', () => {
  it('prioritizes website matches even if names differ', () => {
    expect(
      snapshotMatchesRequest({
        requestedName: 'Acme Manufacturing',
        requestedWebsite: 'https://acme.com',
        snapshotName: 'Acme Manufacturing LLC',
        snapshotWebsite: 'https://acme.com',
      })
    ).toBe(true)
  })

  it('treats trimmed, case-insensitive names as exact matches', () => {
    expect(
      snapshotMatchesRequest({
        requestedName: '  Acme   Manufacturing  ',
        snapshotName: 'acme manufacturing',
      })
    ).toBe(true)
  })

  it('rejects partial name overlaps when website is unavailable', () => {
    expect(
      snapshotMatchesRequest({
        requestedName: 'Acme Manufacturing',
        snapshotName: 'Acme Manufacturing Solutions',
      })
    ).toBe(false)
  })
})
