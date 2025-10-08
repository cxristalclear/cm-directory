import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  
  // Fetch all companies
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // Fetch unique states with companies
  const { data: facilities } = await supabase
    .from('facilities')
    .select('state')
    .not('state', 'is', null)
  
  type FacilityState = { state: string }
  const typedFacilities = (facilities || []) as FacilityState[]
  const uniqueStates = [...new Set(typedFacilities.map(f => f.state))]
  
  type CompanySlug = { slug: string; updated_at: string }
  const typedCompanies = (companies || []) as CompanySlug[]
  
  // Build sitemap entries
  const companyUrls = typedCompanies.map(company => ({
    url: `${baseUrl}/companies/${company.slug}`,
    lastModified: company.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  const stateUrls = uniqueStates.map(state => ({
    url: `${baseUrl}/manufacturers/${state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/manufacturers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/add-your-company`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    ...companyUrls,
    ...stateUrls,
  ]
}