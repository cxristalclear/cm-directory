import type { ReactElement, ReactNode } from 'react'

import Home from '@/app/page'
import CompanyList from '@/components/CompanyList'
import { FilterProvider } from '@/contexts/FilterContext'

function toArray(children: ReactNode): ReactNode[] {
  if (Array.isArray(children)) {
    return children
  }

  if (children === null || children === undefined) {
    return []
  }

  return [children]
}

function findInTree(node: ReactNode, target: React.ComponentType<any>) {
  if (!node || typeof node !== 'object') {
    return null
  }

  const element = node as ReactElement
  if (element.type === target) {
    return element
  }

  const children = toArray(element.props?.children)
  for (const child of children) {
    const match = findInTree(child, target)
    if (match) {
      return match
    }
  }

  return null
}

describe('Home page SSR', () => {
  it('passes initial filters and companies to client components', async () => {
    const element = await Home({ searchParams: { state: 'TX', capability: 'smt' } })
    const providerElement = findInTree(element, FilterProvider)
    const listElement = findInTree(element, CompanyList)

    expect(providerElement).toBeTruthy()
    expect(providerElement?.props.initialFilters.states).toEqual(['TX'])
    expect(providerElement?.props.initialFilters.capabilities).toEqual(['smt'])
    expect(listElement?.props.companies.length).toBeLessThanOrEqual(9)
    expect(listElement?.props.totalCount).toBeGreaterThan(0)
  })

  it('reflects changes in search params across renders', async () => {
    const texas = await Home({ searchParams: { state: 'TX' } })
    const california = await Home({ searchParams: { state: 'CA' } })

    const texasList = findInTree(texas, CompanyList)
    const californiaList = findInTree(california, CompanyList)

    expect(texasList?.props.companies).not.toEqual(californiaList?.props.companies)
    expect(texasList?.props.totalCount).not.toEqual(californiaList?.props.totalCount)
  })

  it('returns a minimal company payload shape', async () => {
    const element = await Home({ searchParams: {} })
    const listElement = findInTree(element, CompanyList)
    const firstCompany = listElement?.props.companies[0]

    expect(firstCompany).toBeDefined()
    const keys = Object.keys(firstCompany).sort()
    expect(keys).toEqual([
      'capabilities',
      'certifications',
      'company_name',
      'dba_name',
      'description',
      'employee_count_range',
      'facilities',
      'id',
      'industries',
      'slug',
    ])
  })
})
