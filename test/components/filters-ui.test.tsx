import { act } from 'react'
import { createRoot } from 'react-dom/client'

import ActiveFiltersBar from '@/components/ActiveFiltersBar'
import FilterSidebar from '@/components/FilterSidebar'
import { FilterProvider } from '@/contexts/FilterContext'
import type { FilterState } from '@/types/company'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/test',
}))

type RenderOptions = {
  initialFilters?: FilterState
}

type RenderResult = {
  container: HTMLDivElement
  root: ReturnType<typeof createRoot>
  unmount: () => void
}

const stateOptions = [
  { value: 'CA', label: 'California', count: 3 },
  { value: 'TX', label: 'Texas', count: 5 },
]

const capabilityOptions = [
  { value: 'smt', label: 'SMT', count: 4 },
  { value: 'through_hole', label: 'Through-Hole', count: 2 },
]

const volumeOptions = [
  { value: 'low', label: 'Low Volume', count: 7 },
  { value: 'high', label: 'High Volume', count: 1 },
]

function renderFiltersUI(options?: RenderOptions): RenderResult {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const initialFilters = options?.initialFilters ?? {
    states: [],
    capabilities: [],
    productionVolume: null,
  }

  act(() => {
    root.render(
      <FilterProvider initialFilters={initialFilters} initialFilteredCount={0}>
        <div>
          <ActiveFiltersBar />
          <FilterSidebar
            stateOptions={stateOptions}
            capabilityOptions={capabilityOptions}
            volumeOptions={volumeOptions}
          />
        </div>
      </FilterProvider>,
    )
  })

  const unmount = () => {
    act(() => {
      root.unmount()
    })
  }

  return { container, root, unmount }
}

describe('Filters UI components', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('toggles state and capability chips when selections change', () => {
    const { container, unmount } = renderFiltersUI()

    const stateCheckbox = container.querySelector<HTMLInputElement>('input[type="checkbox"][value="CA"]')
    const capabilityCheckbox = container.querySelector<HTMLInputElement>('input[type="checkbox"][value="smt"]')

    expect(stateCheckbox).toBeTruthy()
    expect(capabilityCheckbox).toBeTruthy()

    act(() => {
      stateCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      capabilityCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const chips = Array.from(container.querySelectorAll('span')).map(node => node.textContent)
    expect(chips).toEqual(expect.arrayContaining(['CA', 'SMT']))

    act(() => {
      stateCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      capabilityCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const chipsAfterClear = Array.from(container.querySelectorAll('span')).map(node => node.textContent)
    expect(chipsAfterClear).not.toEqual(expect.arrayContaining(['CA', 'SMT']))

    unmount()
  })

  it('selects production volume with radio buttons and shows chip', () => {
    const { container, unmount } = renderFiltersUI()

    const volumeRadio = container.querySelector<HTMLInputElement>('input[type="radio"][value="low"]')
    expect(volumeRadio).toBeTruthy()

    act(() => {
      volumeRadio?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const chipTexts = Array.from(container.querySelectorAll('span')).map(node => node.textContent)
    expect(chipTexts).toEqual(expect.arrayContaining(['Low Volume']))

    unmount()
  })

  it('clear filters button resets to empty state', () => {
    const { container, unmount } = renderFiltersUI()

    const stateCheckbox = container.querySelector<HTMLInputElement>('input[type="checkbox"][value="TX"]')
    const volumeRadio = container.querySelector<HTMLInputElement>('input[type="radio"][value="high"]')

    act(() => {
      stateCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      volumeRadio?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const clearButton = Array.from(container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('Clear all'),
    )
    expect(clearButton).toBeTruthy()

    act(() => {
      clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const chips = Array.from(container.querySelectorAll('span')).map(node => node.textContent)
    expect(chips).not.toEqual(expect.arrayContaining(['TX', 'High Volume']))
    expect(stateCheckbox?.checked).toBe(false)
    expect(volumeRadio?.checked).toBe(false)

    unmount()
  })

  it('renders option counts from props', () => {
    const { container, unmount } = renderFiltersUI()

    const countBadges = Array.from(container.querySelectorAll('span'))
      .map(node => node.textContent?.trim())
      .filter(text => text === '3' || text === '5' || text === '4' || text === '2' || text === '7' || text === '1')

    expect(countBadges).toEqual(expect.arrayContaining(['3', '5', '4', '2', '7', '1']))

    unmount()
  })
})
