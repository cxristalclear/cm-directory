import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCanonicalUrl, siteConfig } from '@/lib/config'
import { CAPABILITY_DEFINITIONS } from '@/lib/capabilities'
import { CERTIFICATION_DIRECTORY } from '@/lib/certifications-data'
import { getBuildTimestamp, toIsoString } from '@/lib/time'
import { getStateMetadataByAbbreviation } from '@/lib/states'

const buildTimestamp = getBuildTimestamp()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true)

  const { data: facilities } = await supabase
    .from('facilities')
    .select('state_code, state, updated_at')
    .or('state_code.not.is.null,state.not.is.null')

  type CompanyRow = { slug: string | null; updated_at: string | null }
  type FacilityRow = { state_code: string | null; state: string | null; updated_at: string | null }
  type ValidCompany = { slug: string; updated_at: string | null }

  const typedCompanies = (companies ?? []) as CompanyRow[]
  const typedFacilities = (facilities ?? []) as FacilityRow[]

  const validCompanies = typedCompanies.filter((company): company is ValidCompany => Boolean(company.slug))

  const states = new Map<string, NonNullable<ReturnType<typeof getStateMetadataByAbbreviation>>>()
  const latestFacilityTimestamp = new Map<string, number>()

  for (const facility of typedFacilities) {
    const stateValue = facility.state_code || facility.state
    if (!stateValue) {
      continue
    }

    const stateMetadata = getStateMetadataByAbbreviation(stateValue)
    if (!stateMetadata) {
      continue
    }

    states.set(stateMetadata.slug, stateMetadata)

    if (!facility.updated_at) {
      continue
    }

    const parsed = Date.parse(facility.updated_at)
    if (Number.isNaN(parsed)) {
      continue
    }

    const current = latestFacilityTimestamp.get(stateMetadata.slug)
    if (current === undefined || parsed > current) {
      latestFacilityTimestamp.set(stateMetadata.slug, parsed)
    }
  }

  const fallbackTimestamp = buildTimestamp

  const companyUrls = validCompanies.map(company => ({
    url: getCanonicalUrl(`/companies/${company.slug}`),
    lastModified: toIsoString(company.updated_at, fallbackTimestamp),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const stateUrls = Array.from(states.values()).map((stateMetadata) => {
    const latestTimestamp = latestFacilityTimestamp.get(stateMetadata.slug)
    const lastModified =
      typeof latestTimestamp === 'number'
        ? new Date(latestTimestamp).toISOString()
        : fallbackTimestamp

    return {
      url: getCanonicalUrl(`/manufacturers/${stateMetadata.slug}`),
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
      url: getCanonicalUrl('/manufacturers'),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/industries'),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/about'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: getCanonicalUrl('/add-your-company'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: getCanonicalUrl('/capabilities'),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/pcb-assembly-manufacturers'),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/certifications'),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  const capabilityUrls = CAPABILITY_DEFINITIONS.map(capability => ({
    url: getCanonicalUrl(`/capabilities/${capability.slug}`),
    lastModified: buildTimestamp,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const certificationUrls = Object.values(CERTIFICATION_DIRECTORY).map(certification => ({
    url: getCanonicalUrl(`/certifications/${certification.slug}`),
    lastModified: buildTimestamp,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const evergreenUrls = evergreenPages.map(page => ({
    ...page,
    lastModified: buildTimestamp,
  }))

  return [
    ...evergreenUrls,
    ...capabilityUrls,
    ...certificationUrls,
    ...companyUrls,
    ...stateUrls,
  ]
}
