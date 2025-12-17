export {}

import { createClient } from '@/lib/supabase-server'

jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>

beforeAll(() => {
  if (typeof globalThis.Response === 'undefined') {
    class SimpleResponse {
      readonly status: number
      readonly headers: Map<string, string>
      private readonly bodyContent: string

      constructor(body?: BodyInit | null, init?: ResponseInit) {
        this.bodyContent = typeof body === 'string' ? body : body ? String(body) : ''
        this.status = init?.status ?? 200
        this.headers = new Map<string, string>()

        if (init?.headers && typeof init.headers === 'object') {
          Object.entries(init.headers as Record<string, string>).forEach(([key, value]) => {
            this.headers.set(key.toLowerCase(), value)
          })
        }
      }

      async text(): Promise<string> {
        return this.bodyContent
      }
    }

    // @ts-expect-error - minimal Response polyfill for tests
    globalThis.Response = SimpleResponse
  }
})

describe('RSS feed generation', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BUILD_TIMESTAMP
    delete process.env.BUILD_TIMESTAMP
  })

  it('serializes recent company updates with canonical URLs', async () => {
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = '2024-04-01T00:00:00Z'

    const limitMock = jest.fn().mockResolvedValue({
      data: [
        {
          slug: 'beta-manufacturing',
          company_name: 'Beta Manufacturing',
          description: 'Beta description',
          updated_at: '2024-04-02T00:00:00Z',
          cms_metadata: { canonical_path: '/profiles/beta-manufacturing' },
        },
        {
          slug: 'alpha-industries',
          company_name: 'Alpha Industries',
          description: 'Alpha description',
          updated_at: null,
          cms_metadata: null,
        },
        {
          slug: null,
          company_name: 'Missing Slug Co.',
          description: 'Should be filtered out',
          updated_at: '2024-04-03T00:00:00Z',
          cms_metadata: null,
        },
      ],
      error: null,
    })

    const orderMock = jest.fn().mockReturnValue({ limit: limitMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })

    mockedCreateClient.mockResolvedValue({
      from: (table: string) => {
        if (table === 'companies') {
          return { select: selectMock }
        }
        throw new Error(`Unexpected table ${table}`)
      },
    } as any)

    const { GET } = await import('@/app/feed.xml/route')
    const response = await GET()
    const xml = await response.text()

    expect(response.status).toBe(200)
    expect(selectMock).toHaveBeenCalled()

    const betaIndex = xml.indexOf('Beta Manufacturing')
    const alphaIndex = xml.indexOf('Alpha Industries')
    expect(betaIndex).toBeGreaterThan(-1)
    expect(alphaIndex).toBeGreaterThan(-1)
    expect(betaIndex).toBeLessThan(alphaIndex)

    expect(xml).toContain('<link>https://www.pcbafinder.com/profiles/beta-manufacturing</link>')
    expect(xml).toContain('<guid isPermaLink="true">https://www.pcbafinder.com/profiles/beta-manufacturing</guid>')
    expect(xml).toContain('<link>https://www.pcbafinder.com/companies/alpha-industries</link>')
    expect(xml).toContain('<pubDate>Tue, 02 Apr 2024 00:00:00 GMT</pubDate>')
    expect(xml).toContain('<pubDate>Mon, 01 Apr 2024 00:00:00 GMT</pubDate>')
    expect(xml).not.toContain('Missing Slug Co.')
    expect(xml).toContain('<atom:link href="https://www.pcbafinder.com/feed.xml" rel="self" type="application/rss+xml" />')
  })

  it('returns 500 status when Supabase query fails', async () => {
    const limitMock = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error', code: 'PGRST116' },
    })

    const orderMock = jest.fn().mockReturnValue({ limit: limitMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })

    mockedCreateClient.mockResolvedValue({
      from: () => ({ select: selectMock }),
    } as any)

    const { GET } = await import('@/app/feed.xml/route')
    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(500)
    expect(body).toBe('Internal Server Error')
  })

  it('returns 500 status when unexpected error occurs', async () => {
    mockedCreateClient.mockRejectedValue(new Error('Unexpected error'))

    const { GET } = await import('@/app/feed.xml/route')
    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(500)
    expect(body).toBe('Internal Server Error')
  })
})
