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

  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://www.pcbafinder.com/')
    setEnv('NEXT_PUBLIC_TWITTER_URL', 'https://twitter.com/pcbafinder')
    setEnv('NEXT_PUBLIC_LINKEDIN_URL', 'https://www.linkedin.com/company/pcbafinder')
    setEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/pcbafinder/app')

     const { siteConfig, OG_IMAGE_PATH } = loadConfig()

    expect(siteConfig.url).toBe('https://www.pcbafinder.com')
    expect(siteConfig.ogImage).toBe(`https://www.pcbafinder.com${OG_IMAGE_PATH}`)
    expect(siteConfig.links).toEqual({
      twitter: 'https://twitter.com/pcbafinder',
      linkedin: 'https://www.linkedin.com/company/pcbafinder',
      github: 'https://github.com/pcbafinder/app',
    })
  })

  it('falls back to documented defaults when optional metadata env vars are missing', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    const warningSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const { siteConfig } = loadConfig()

    expect(siteConfig.url).toBe('https://www.pcbafinder.com')
    expect(siteConfig.links).toEqual({
      twitter: 'https://twitter.com/pcbafinder',
      linkedin: 'https://www.linkedin.com/company/pcbafinder',
      github: 'https://github.com/pcbafinder/app',
    })

    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing optional environment variables:')
    )

    warningSpy.mockRestore()
  })

  it('warns and uses demo Supabase defaults when Supabase env vars are missing', () => {
    setEnv('NODE_ENV', 'production')
    deleteEnv('NEXT_PUBLIC_SUPABASE_URL')
    deleteEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const warningSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const { supabaseConfig } = loadConfig()

    expect(supabaseConfig.url).toBe('https://demo.supabase.co')
    expect(supabaseConfig.anonKey).toBe('demo-key')
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing required environment variables:')
    )

    warningSpy.mockRestore()
  })

  it('throws when placeholder handles are provided in production', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    setEnv('NEXT_PUBLIC_SITE_URL', 'https://www.pcbafinder.com')
    setEnv('NEXT_PUBLIC_TWITTER_URL', 'https://twitter.com/your_handle')
    setEnv('NEXT_PUBLIC_LINKEDIN_URL', 'https://www.linkedin.com/company/pcbafinder')
    setEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/pcbafinder/app')

    expect(() => loadConfig()).toThrow('Placeholder environment variable(s) detected')
  })
})
