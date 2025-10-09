type ConfigModule = typeof import('../../lib/config')

describe('site configuration', () => {
  const ORIGINAL_ENV = process.env
  const mutableEnv = () => process.env as NodeJS.ProcessEnv & Record<string, string | undefined>
  const setEnv = (key: string, value: string | undefined) => {
    mutableEnv()[key] = value
  }
  const deleteEnv = (key: string) => {
    delete mutableEnv()[key]
  }

  const loadConfig = () => require('../../lib/config') as ConfigModule

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    setEnv('NODE_ENV', 'test')
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('maps environment-backed urls into the site config', () => {
    setEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://www.cm-directory.com/')
    setEnv('NEXT_PUBLIC_TWITTER_URL', 'https://twitter.com/cm_directory')
    setEnv('NEXT_PUBLIC_LINKEDIN_URL', 'https://www.linkedin.com/company/cm-directory')
    setEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/cm-directory/app')

    const { siteConfig } = loadConfig()

    expect(siteConfig.url).toBe('https://www.cm-directory.com')
    expect(siteConfig.ogImage).toBe('https://www.cm-directory.com/og-image.png')
    expect(siteConfig.links).toEqual({
      twitter: 'https://twitter.com/cm_directory',
      linkedin: 'https://www.linkedin.com/company/cm-directory',
      github: 'https://github.com/cm-directory/app',
    })
  })

  it('falls back to documented defaults when optional metadata env vars are missing', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const { siteConfig } = loadConfig()

    expect(siteConfig.url).toBe('https://www.cm-directory.com')
    expect(siteConfig.links).toEqual({
      twitter: 'https://twitter.com/cmdirectory',
      linkedin: 'https://www.linkedin.com/company/cm-directory',
      github: 'https://github.com/cm-directory/app',
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing optional environment variables:')
    )

    warnSpy.mockRestore()
  })

  it('throws when required Supabase env vars are missing', () => {
    setEnv('NODE_ENV', 'production')
    deleteEnv('NEXT_PUBLIC_SUPABASE_URL')
    deleteEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(() => loadConfig()).toThrow('Missing required environment variables:')

    warnSpy.mockRestore()
  })

  it('throws when placeholder handles are provided in production', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://www.cm-directory.com')
    setEnv('NEXT_PUBLIC_TWITTER_URL', 'https://twitter.com/your_handle')
    setEnv('NEXT_PUBLIC_LINKEDIN_URL', 'https://www.linkedin.com/company/cm-directory')
    setEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/cm-directory/app')

    expect(() => loadConfig()).toThrow('Placeholder environment variable(s) detected')
  })
})
