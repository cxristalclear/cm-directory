import { filterCompanies, filterFacilitiesByLocation } from '@/utils/filtering'
import type { FilterState } from '@/types/company'
import type { HomepageCompanyWithLocations, HomepageFacility } from '@/types/homepage'

const baseFilters: FilterState = {
  countries: [],
  states: [],
  capabilities: [],
  productionVolume: null,
  searchQuery: "",
}

const facilityWithCountry = (
  country: string,
  stateOrExtras?: string | Partial<HomepageFacility>,
  extras?: Partial<HomepageFacility>,
): HomepageFacility => {
  const state = typeof stateOrExtras === 'string' ? stateOrExtras : undefined
  const extraProps =
    (typeof stateOrExtras === 'string' ? extras : stateOrExtras) ?? {}

  return {
    id: `facility-${country}-${state ?? 'none'}`,
    country,
    state: state ?? null,
    ...extraProps,
  } as unknown as HomepageFacility
}

const facilityWithoutCountry = (): HomepageFacility =>
  ({
    id: 'facility-no-country',
    country: null,
    state: 'TX',
  } as unknown as HomepageFacility)

const buildCompany = (
  slug: string,
  facilities: HomepageFacility[],
  overrides: Partial<HomepageCompanyWithLocations> = {},
): HomepageCompanyWithLocations =>
  ({
    id: slug,
    slug,
    company_name: slug,
    facilities,
    ...overrides,
  } as unknown as HomepageCompanyWithLocations)

describe('filtering utilities', () => {
  it('excludes facilities without a country when filtering companies by country', () => {
    const filters: FilterState = { ...baseFilters, countries: ['CA'] }
    const companies = [
      buildCompany('with-country', [facilityWithCountry('CA')]),
      buildCompany('without-country', [facilityWithoutCountry()]),
    ]

    const result = filterCompanies(companies, filters)

    expect(result.map((company) => company.slug)).toEqual(['with-country'])
  })

  it('filters facilities without a country when applying location filters', () => {
    const filters: FilterState = { ...baseFilters, countries: ['US'] }
    const facilities = [
      facilityWithCountry('US', 'CA'),
      facilityWithoutCountry(),
    ]

    const result = filterFacilitiesByLocation(facilities, filters)

    expect(result).toHaveLength(1)
    expect(result[0]?.country).toBe('US')
  })

  it('matches international state/province filters after normalization', () => {
    const filters: FilterState = { ...baseFilters, states: ['hsinchu'] }
    const companies = [
      buildCompany('intl', [
        facilityWithCountry('TW', { state_province: 'Hsinchu' }),
      ]),
    ]

    const result = filterCompanies(companies, filters)
    expect(result.map((company) => company.slug)).toEqual(['intl'])
  })

  it('filters companies by search query across company and DBA names', () => {
    const filters: FilterState = { ...baseFilters, searchQuery: 'alpha' }
    const companies = [
      buildCompany('alpha', [], { company_name: 'Alpha Manufacturing Group' }),
      buildCompany('beta', [], { company_name: 'Beta Labs', dba_name: 'Alpha Solutions' }),
      buildCompany('gamma', [], { company_name: 'Gamma Corp' }),
    ]

    const result = filterCompanies(companies, filters)
    expect(result.map((company) => company.slug)).toEqual(['alpha', 'beta'])
  })
})
