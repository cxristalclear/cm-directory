import { act } from 'react'
import { createRoot } from 'react-dom/client'

import CompanyList from '@/components/CompanyList'
import { FilterProvider } from '@/contexts/FilterContext'
import type { CompanyListItem, FilterState, PageInfo } from '@/types/company'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  usePathname: jest.fn(() => '/directory'),
  useSearchParams: jest.fn(() => new URLSearchParams('state=CA&capability=smt')),
}))

jest.mock('@/utils/filtering', () => ({
  filterCompanies: jest.fn(() => []),
}))

type RenderOptions = {
  companies?: CompanyListItem[]
  totalCount?: number
  pageInfo?: PageInfo
  initialFilters?: FilterState
}

function createCompany(index: number, overrides?: Partial<CompanyListItem>): CompanyListItem {
  return {
    id: `company-${index}`,
    slug: `company-${index}`,
    company_name: `Company ${index}`,
    dba_name: null,
    description: `Description ${index}`,
    employee_count_range: '150-500',
    facilities: [
      {
        id: `facility-${index}`,
        city: 'Austin',
        state: 'TX',
        latitude: 30.0,
        longitude: -97.0,
        facility_type: 'Manufacturing',
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: false,
        cable_harness_assembly: false,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: `industry-${index}`, company_id: `company-${index}`, industry_name: 'Industrial Controls' },
    ],
    certifications: [
      { id: `cert-${index}`, company_id: `company-${index}`, certification_type: 'ISO 9001' },
    ],
    ...overrides,
  }
}

function renderCompanyList({
  companies = Array.from({ length: 9 }, (_, i) => createCompany(i + 1)),
  totalCount = 9,
  pageInfo = { hasNext: false, hasPrev: false } as PageInfo,
  initialFilters = { states: [], capabilities: [], productionVolume: null },
}: RenderOptions = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(
      <FilterProvider initialFilters={initialFilters} initialFilteredCount={totalCount}>
        <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
      </FilterProvider>,
    )
  })

  const unmount = () => {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  return { container, unmount }
}

describe('CompanyList', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('renders provided companies and total summary', () => {
    const { container, unmount } = renderCompanyList()
    const cards = container.querySelectorAll('a[href^="/companies/"]')
    expect(cards.length).toBe(9)
    expect(container.textContent).toContain('9 results')
    unmount()
  })

  it('preserves existing query params when navigating with pagination', () => {
    const replaceMock = jest.fn()
    const navigation = require('next/navigation') as {
      useRouter: jest.Mock
    }
    navigation.useRouter.mockReturnValue({ replace: replaceMock })
    const { container, unmount } = renderCompanyList({
      pageInfo: { hasNext: true, hasPrev: false, nextCursor: 'c:9' },
      totalCount: 12,
    })

    const nextButton = Array.from(container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('Next'),
    )
    expect(nextButton).toBeTruthy()

    act(() => {
      nextButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(replaceMock).toHaveBeenCalledWith('/directory?state=CA&capability=smt&cursor=c%3A9', { scroll: false })
    unmount()
  })

  it('does not call legacy filter utility', () => {
    renderCompanyList()
    const { filterCompanies } = require('@/utils/filtering')
    expect(filterCompanies).not.toHaveBeenCalled()
  })
})
