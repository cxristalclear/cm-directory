import { getCanonicalUrl } from '@/lib/config'

const fromMock = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}))

describe('sitemap metadata serialization', () => {
  beforeEach(() => {
    jest.resetModules()
    fromMock.mockReset()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BUILD_TIMESTAMP
    delete process.env.BUILD_TIMESTAMP
  })

  it('returns ISO formatted lastModified values', async () => {
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = '2024-04-01T00:00:00Z'

    fromMock.mockImplementation((table: string) => {
      if (table === 'companies') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                { slug: 'acme-industries', updated_at: '2024-03-30T12:34:56Z' },
                { slug: 'fallback-manufacturing', updated_at: null },
              ],
            }),
          }),
        }
      }

      if (table === 'facilities') {
        const or = jest.fn().mockResolvedValue({
          data: [
            { state: 'CA', updated_at: '2024-03-29T08:15:00Z' },
            { state: 'CA', updated_at: '2024-03-30T08:15:00Z' },
            { state: 'TX', updated_at: null },
          ],
        })

        return {
          select: jest.fn().mockReturnValue({
            or,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()

    const companyEntry = entries.find(entry => entry.url.endsWith('/companies/acme-industries'))
    const fallbackCompanyEntry = entries.find(entry =>
      entry.url.endsWith('/companies/fallback-manufacturing')
    )
    const californiaEntry = entries.find(entry => entry.url.endsWith('/manufacturers/california'))
    const texasEntry = entries.find(entry => entry.url.endsWith('/manufacturers/texas'))
    const rootEntry = entries.find(entry => entry.url === 'https://www.pcbafinder.com')
    const manufacturersEntry = entries.find(entry => entry.url === getCanonicalUrl('/manufacturers'))
    const industriesEntry = entries.find(entry => entry.url === getCanonicalUrl('/industries'))
    const aboutEntry = entries.find(entry => entry.url === getCanonicalUrl('/about'))
    const addCompanyEntry = entries.find(entry => entry.url === getCanonicalUrl('/add-your-company'))

    expect(companyEntry?.lastModified).toBe('2024-03-30T12:34:56.000Z')
    expect(fallbackCompanyEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(californiaEntry?.lastModified).toBe('2024-03-30T08:15:00.000Z')
    expect(texasEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(rootEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(rootEntry?.changeFrequency).toBe('daily')
    expect(manufacturersEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(manufacturersEntry?.changeFrequency).toBe('daily')
    expect(industriesEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(industriesEntry?.changeFrequency).toBe('weekly')
    expect(aboutEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(aboutEntry?.changeFrequency).toBe('monthly')
    expect(addCompanyEntry?.lastModified).toBe('2024-04-01T00:00:00.000Z')
    expect(addCompanyEntry?.changeFrequency).toBe('monthly')

    for (const entry of entries) {
      expect(entry.lastModified).toMatch(/Z$/)
    }
  })
})
