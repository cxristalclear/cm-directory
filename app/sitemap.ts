import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/lib/config'

function toIsoString(value: string | Date | null | undefined, fallback: string): string {
  if (!value) {
    return fallback
  }

  const dateValue = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(dateValue.getTime())) {
    return fallback
  }

  return dateValue.toISOString()
}

const defaultBuildTimestamp = new Date().toISOString()
const buildTimestamp = toIsoString(
  process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? process.env.BUILD_TIMESTAMP,
  defaultBuildTimestamp
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true)

  const { data: facilities } = await supabase
    .from('facilities')
    .select('state, updated_at')
    .not('state', 'is', null)

  type CompanyRow = { slug: string | null; updated_at: string | null }
  type FacilityRow = { state: string | null; updated_at: string | null }
  type ValidCompany = { slug: string; updated_at: string | null }

  const typedCompanies = (companies ?? []) as CompanyRow[]
  const typedFacilities = (facilities ?? []) as FacilityRow[]

  const validCompanies = typedCompanies.filter((company): company is ValidCompany => Boolean(company.slug))

  const states = new Set<string>()
  const latestFacilityTimestamp = new Map<string, number>()

  for (const facility of typedFacilities) {
    if (!facility.state) {
      continue
    }

    states.add(facility.state)

    if (!facility.updated_at) {
      continue
    }

    const parsed = Date.parse(facility.updated_at)
    if (Number.isNaN(parsed)) {
      continue
    }

    const current = latestFacilityTimestamp.get(facility.state)
    if (current === undefined || parsed > current) {
      latestFacilityTimestamp.set(facility.state, parsed)
    }
  }

  const fallbackTimestamp = buildTimestamp

  const companyUrls = validCompanies.map(company => ({
    url: `${baseUrl}/companies/${company.slug}`,
    lastModified: toIsoString(company.updated_at, fallbackTimestamp),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const stateUrls = Array.from(states).map(state => {
    const latestTimestamp = latestFacilityTimestamp.get(state)
    const lastModified =
      typeof latestTimestamp === 'number'
        ? new Date(latestTimestamp).toISOString()
        : fallbackTimestamp

    return {
      url: `${baseUrl}/manufacturers/${state.toLowerCase()}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }
  })

  const evergreenPages = [
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/manufacturers`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/add-your-company`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  const evergreenUrls = evergreenPages.map(page => ({
    ...page,
    lastModified: buildTimestamp,
  }))

  return [...evergreenUrls, ...companyUrls, ...stateUrls]
}
