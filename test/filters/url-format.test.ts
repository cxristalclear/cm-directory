import { parseFiltersFromSearchParams, serializeFiltersToSearchParams } from '../../lib/filters/url'

describe('filter URL helpers', () => {
  it('round-trips state, capability, and volume selections', () => {
    const params = serializeFiltersToSearchParams({
      countries: ['US', 'CA'],
      states: ['TX', 'CA'],
      capabilities: ['prototyping', 'smt'],
      productionVolume: 'high',
      searchQuery: '',
    })

    expect(params.toString()).toBe(
      'countries=CA&countries=US&state=CA&state=TX&capability=prototyping&capability=smt&volume=high',
    )

    const parsed = parseFiltersFromSearchParams(params)

    expect(parsed).toEqual({
      countries: ['CA', 'US'],
      states: ['CA', 'TX'],
      capabilities: ['prototyping', 'smt'],
      productionVolume: 'high',
      searchQuery: '',
    })
  })

  it('dedupes and sorts multi-select query params', () => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams('state=TX&state=CA&state=TX'))

    expect(parsed.states).toEqual(['CA', 'TX'])
  })

  it('ignores unknown filter values safely', () => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams('state=ZZ&capability=unknown&volume=foo'))

    expect(parsed).toEqual({ 
      countries: [],
      states: [], 
      capabilities: [], 
      productionVolume: null,
      searchQuery: '',
    })
  })

  it('produces stable query parameter ordering', () => {
    const params = serializeFiltersToSearchParams({
      countries: ['US', 'CA'],
      states: ['TX', 'CA'],
      capabilities: ['smt', 'prototyping'],
      productionVolume: 'medium',
      searchQuery: '',
    })

    expect(params.toString()).toBe(
      'countries=CA&countries=US&state=CA&state=TX&capability=prototyping&capability=smt&volume=medium',
    )
  })

  it('parses from plain record inputs', () => {
    const parsed = parseFiltersFromSearchParams({
      countries: ['us', 'ca'],
      state: ['ca', 'ny'],
      capability: ['SMT', 'through_hole'],
      volume: 'LOW',
      q: '',
    })

    expect(parsed).toEqual({
      countries: ['CA', 'US'],
      states: ['CA', 'NY'],
      capabilities: ['smt', 'through_hole'],
      productionVolume: 'low',
      searchQuery: '',
    })
  })

  it('handles countries filtering', () => {
    const params = serializeFiltersToSearchParams({
      countries: ['US', 'CA', 'MX'],
      states: [],
      capabilities: [],
      productionVolume: null,
      searchQuery: '',
    })

    expect(params.toString()).toBe('countries=CA&countries=MX&countries=US')

    const parsed = parseFiltersFromSearchParams(params)
    expect(parsed.countries).toEqual(['CA', 'MX', 'US'])
  })

  it('handles empty filters', () => {
    const params = serializeFiltersToSearchParams({
      countries: [],
      states: [],
      capabilities: [],
      productionVolume: null,
      searchQuery: '',
    })

    expect(params.toString()).toBe('')
  })

  it('parses countries from URL params', () => {
    const parsed = parseFiltersFromSearchParams(
      new URLSearchParams('countries=US&countries=CA&state=TX')
    )

    expect(parsed).toEqual({
      countries: ['CA', 'US'],
      states: ['TX'],
      capabilities: [],
      productionVolume: null,
      searchQuery: '',
    })
  })

  it('normalizes country codes to uppercase', () => {
    const parsed = parseFiltersFromSearchParams(
      new URLSearchParams('countries=us&countries=ca&countries=mx')
    )

    expect(parsed.countries).toEqual(['CA', 'MX', 'US'])
  })

  it('handles both singular and plural param names', () => {
    const parsed1 = parseFiltersFromSearchParams(
      new URLSearchParams('country=US&state=CA&capability=smt')
    )

    const parsed2 = parseFiltersFromSearchParams(
      new URLSearchParams('countries=US&states=CA&capabilities=smt')
    )

    expect(parsed1).toEqual(parsed2)
  })
})
