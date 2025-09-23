import { act } from 'react'
import { createRoot } from 'react-dom/client'

import { FilterProvider, useFilters } from '@/contexts/FilterContext'
import type { FilterContextType, FilterState, ProductionVolume } from '@/types/company'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/test',
}))

describe('FilterContext contract', () => {
  function renderWithProvider(
    ui: React.ReactElement,
    options?: { initialFilters?: FilterState; initialFilteredCount?: number },
  ): { root: ReturnType<typeof createRoot>; container: HTMLDivElement } {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <FilterProvider
          initialFilters={options?.initialFilters}
          initialFilteredCount={options?.initialFilteredCount}
        >
          {ui}
        </FilterProvider>,
      )
    })

    return { root, container }
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('initializes from supplied initialFilters', () => {
    const initialFilters: FilterState = {
      states: ['CA', 'TX'],
      capabilities: ['smt'],
      productionVolume: 'medium',
    }

    let context: FilterContextType | undefined

    function TestConsumer() {
      context = useFilters()
      return null
    }

    const { root } = renderWithProvider(<TestConsumer />, { initialFilters })

    expect(context?.filters).toEqual({
      states: ['CA', 'TX'],
      capabilities: ['smt'],
      productionVolume: 'medium',
    })

    act(() => {
      root.unmount()
    })
  })

  it('provides typed update helpers', () => {
    const initialFilters: FilterState = {
      states: [],
      capabilities: [],
      productionVolume: null,
    }

    let context: FilterContextType | undefined

    function TestConsumer() {
      context = useFilters()
      return null
    }

    const { root } = renderWithProvider(<TestConsumer />, { initialFilters })
    expect(context).toBeDefined()

    act(() => {
      context!.updateFilter('states', ['CA', 'TX'])
    })
    expect(context!.filters.states).toEqual(['CA', 'TX'])

    act(() => {
      context!.updateFilter('productionVolume', 'high')
    })
    expect(context!.filters.productionVolume).toBe('high')

    act(() => {
      context!.setFilters(previous => ({ ...previous, capabilities: ['smt'] }))
    })
    expect(context!.filters.capabilities).toEqual(['smt'])

    act(() => {
      context!.clearFilters()
    })
    expect(context!.filters).toEqual({ states: [], capabilities: [], productionVolume: null })

    if (context) {
      const states: string[] = context.filters.states
      const volume: ProductionVolume | null = context.filters.productionVolume
      expect(Array.isArray(states)).toBe(true)
      expect(volume === null || typeof volume === 'string').toBe(true)

      if (false) {
        // @ts-expect-error states must be updated with a string array
        context.updateFilter('states', 'CA')
        // @ts-expect-error productionVolume must be a scalar value
        context.updateFilter('productionVolume', ['low'])
      }
    }

    act(() => {
      root.unmount()
    })
})

})
