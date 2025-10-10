import { filterCompanies, filterFacilitiesByLocation } from '@/utils/filtering'
import type { FilterState } from '@/types/company'
import type { HomepageCompany, HomepageFacility } from '@/types/homepage'

const baseFilters: FilterState = {
  countries: [],
  states: [],
  capabilities: [],
  productionVolume: null,
}

const facilityWithCountry = (country: string, state?: string): HomepageFacility =>
  ({
    id: `facility-${country}-${state ?? 'none'}`,
    country,
    state: state ?? null,
  } as unknown as HomepageFacility)

const facilityWithoutCountry = (): HomepageFacility =>
  ({
    id: 'facility-no-country',
    country: null,
    state: 'TX',
  } as unknown as HomepageFacility)

const buildCompany = (
  slug: string,
  facilities: HomepageFacility[],
): HomepageCompany =>
  ({
    id: slug,
    slug,
    company_name: slug,
    facilities,
  } as unknown as HomepageCompany)

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
})
