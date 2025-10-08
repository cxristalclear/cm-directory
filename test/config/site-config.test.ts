type ConfigModule = typeof import('../../lib/config')

describe('site configuration', () => {
  const ORIGINAL_ENV = process.env

  const loadConfig = () => require('../../lib/config') as ConfigModule

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('maps environment-backed urls into the site config', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.cm-directory.com/'
    process.env.NEXT_PUBLIC_TWITTER_URL = 'https://twitter.com/cm_directory'
    process.env.NEXT_PUBLIC_LINKEDIN_URL =
      'https://www.linkedin.com/company/cm-directory'
    process.env.NEXT_PUBLIC_GITHUB_URL = 'https://github.com/cm-directory/app'

    const { siteConfig } = loadConfig()

    expect(siteConfig.url).toBe('https://www.cm-directory.com')
    expect(siteConfig.ogImage).toBe('https://www.cm-directory.com/og-image.png')
    expect(siteConfig.links).toEqual({
      twitter: 'https://twitter.com/cm_directory',
      linkedin: 'https://www.linkedin.com/company/cm-directory',
      github: 'https://github.com/cm-directory/app',
    })
  })

  it('throws when placeholder handles are provided in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.cm-directory.com'
    process.env.NEXT_PUBLIC_TWITTER_URL = 'https://twitter.com/your_handle'
    process.env.NEXT_PUBLIC_LINKEDIN_URL =
      'https://www.linkedin.com/company/cm-directory'
    process.env.NEXT_PUBLIC_GITHUB_URL = 'https://github.com/cm-directory/app'

    expect(() => loadConfig()).toThrow('Placeholder environment variable(s) detected')
  })
})
