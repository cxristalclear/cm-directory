import { buildFilterUrl, type FilterUrlState } from '../../lib/filters/url'

describe('buildFilterUrl', () => {
  it('returns the base path when no filters are active', () => {
    const filters: FilterUrlState = { states: [], capabilities: [], productionVolume: null }

    expect(buildFilterUrl('/manufacturers', filters)).toBe('/manufacturers')
  })

  it('serializes filters into a stable, normalized query string', () => {
    const filters: FilterUrlState = {
      states: ['tx', 'CA'],
      capabilities: ['through_hole', 'smt'],
      productionVolume: 'high',
    }

    expect(buildFilterUrl('/manufacturers', filters)).toBe(
      '/manufacturers?state=CA&state=TX&capability=smt&capability=through_hole&volume=high',
    )
  })
})
