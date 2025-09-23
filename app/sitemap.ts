import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com'
  
  // Fetch all companies
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // Fetch unique states with companies
  const { data: states } = await supabase
    .from('facilities')
    .select('state')
    .not('state', 'is', null)
  
  const uniqueStates = [...new Set(states?.map(s => s.state) || [])]
  
  // Build sitemap entries
  const companyUrls = companies?.map(company => ({
    url: `${baseUrl}/companies/${company.slug}`,
    lastModified: company.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []
  
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
    ...companyUrls,
    ...stateUrls,
    // Add category pages when you create them
    {
      url: `${baseUrl}/manufacturers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]
}