import {
  CANONICAL_CAPABILITIES,
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
} from '../../lib/filters/url'

describe('url-format filter helpers', () => {
  it('url-format round-trips canonical filters with deterministic serialization', () => {
    const params = serializeFiltersToSearchParams({
      states: ['tx', 'CA'],
      capabilities: ['through_hole', 'smt'],
      productionVolume: 'high',
    })

    expect(params.toString()).toBe(
      'state=CA&state=TX&capability=smt&capability=through_hole&volume=high',
    )

    const parsed = parseFiltersFromSearchParams(params)

    expect(parsed).toEqual({
      states: ['CA', 'TX'],
      capabilities: ['smt', 'through_hole'],
      productionVolume: 'high',
    })
  })

  it('url-format ignores unknown filter values safely', () => {
    const parsed = parseFiltersFromSearchParams(
      new URLSearchParams('state=ZZ&capability=prototyping&capability=smt&volume=foo'),
    )

    expect(parsed).toEqual({ states: [], capabilities: ['smt'], productionVolume: null })
  })

  it('url-format dedupes and sorts multi-select query params deterministically', () => {
    const parsed = parseFiltersFromSearchParams(
      new URLSearchParams(
        'state=TX&state=CA&state=TX&capability=mixed&capability=Mixed&capability=through_hole',
      ),
    )

    expect(parsed.states).toEqual(['CA', 'TX'])
    expect(parsed.capabilities).toEqual(['mixed', 'through_hole'])
  })

  it('url-format parses from plain record inputs', () => {
    const parsed = parseFiltersFromSearchParams({
      state: ['ca', 'ny'],
      capability: [CANONICAL_CAPABILITIES[0], 'THROUGH_HOLE'],
      volume: 'LOW',
    })

    expect(parsed).toEqual({
      states: ['CA', 'NY'],
      capabilities: ['smt', 'through_hole'],
      productionVolume: 'low',
    })
  })
})
