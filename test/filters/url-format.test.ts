import { parseFiltersFromSearchParams, serializeFiltersToSearchParams } from '../../lib/filters/url'

describe('filter URL helpers', () => {
  it('round-trips state, capability, and volume selections', () => {
    const params = serializeFiltersToSearchParams({
      states: ['tx', 'CA'],
      capabilities: ['prototyping', 'smt'],
      productionVolume: 'high',
    })

    expect(params.toString()).toBe(
      'state=CA&state=TX&capability=prototyping&capability=smt&volume=high',
    )

    const parsed = parseFiltersFromSearchParams(params)

    expect(parsed).toEqual({
      states: ['CA', 'TX'],
      capabilities: ['prototyping', 'smt'],
      productionVolume: 'high',
    })
  })

  it('dedupes and sorts multi-select query params', () => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams('state=TX&state=CA&state=TX'))

    expect(parsed.states).toEqual(['CA', 'TX'])
  })

  it('ignores unknown filter values safely', () => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams('state=ZZ&capability=unknown&volume=foo'))

    expect(parsed).toEqual({ states: [], capabilities: [], productionVolume: null })
  })

  it('produces stable query parameter ordering', () => {
    const params = serializeFiltersToSearchParams({
      states: ['TX', 'CA'],
      capabilities: ['smt', 'prototyping'],
      productionVolume: 'medium',
    })

    expect(params.toString()).toBe(
      'state=CA&state=TX&capability=prototyping&capability=smt&volume=medium',
    )
  })

  it('parses from plain record inputs', () => {
    const parsed = parseFiltersFromSearchParams({
      state: ['ca', 'ny'],
      capability: ['SMT', 'through_hole'],
      volume: 'LOW',
    })

    expect(parsed).toEqual({
      states: ['CA', 'NY'],
      capabilities: ['smt', 'through_hole'],
      productionVolume: 'low',
    })
  })
})
