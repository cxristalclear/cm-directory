import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import type { ReactElement, ReactNode } from 'react'

import Home from '@/app/page'
import CertManufacturers from '@/app/contract-manufacturers/[cert]/page'
import CertificationPage from '@/app/certifications/[certification]/page'
import IndustryPage from '@/app/industries/[industry]/page'
import StateManufacturersPage from '@/app/manufacturers/[state]/page'
import Pagination from '@/components/Pagination'
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

function findProvider(node: ReactNode): ReactElement | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const element = node as ReactElement
  if (element.type === FilterProvider) {
    return element
  }

  for (const child of toArray(element.props?.children)) {
    const match = findProvider(child)
    if (match) {
      return match
    }
  }

  return null
}

describe('Listing pages include FilterProvider', () => {
  it('wraps home page content', async () => {
    const element = await Home({ searchParams: {} })
    expect(findProvider(element)).toBeTruthy()
  })

  it('wraps contract manufacturers page', async () => {
    const element = await CertManufacturers({ params: { cert: 'iso-13485' }, searchParams: {} })
    expect(findProvider(element)).toBeTruthy()
  })

  it('wraps certification page', async () => {
    const element = await CertificationPage({ params: Promise.resolve({ certification: 'iso-9001' }), searchParams: {} })
    expect(findProvider(element)).toBeTruthy()
  })

  it('wraps industry page', async () => {
    const element = await IndustryPage({ params: Promise.resolve({ industry: 'medical-devices' }), searchParams: {} })
    expect(findProvider(element)).toBeTruthy()
  })

  it('wraps state page', async () => {
    const element = await StateManufacturersPage({ params: { state: 'texas' }, searchParams: {} })
    expect(findProvider(element)).toBeTruthy()
  })
})

describe('Pagination component', () => {
  it('invokes cursor callbacks', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handler = jest.fn()

    act(() => {
      root.render(
        <Pagination
          hasNext
          hasPrev
          nextCursor="c:9"
          prevCursor="c:0"
          onCursorChange={handler}
        />,
      )
    })

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(2)

    act(() => {
      buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(handler).toHaveBeenNthCalledWith(1, 'c:0')
    expect(handler).toHaveBeenNthCalledWith(2, 'c:9')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
