import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getCanonicalUrl, siteConfig } from '@/lib/config'
import type { HomepageFacility } from '@/types/homepage'

type FacilityLocationFields = Pick<
  HomepageFacility,
  'city' | 'state' | 'state_province' | 'state_code' | 'country' | 'country_code'
>

export function buildLocationString(facility?: FacilityLocationFields | null): string {
  if (!facility) return ''

  const region = facility.state_province || facility.state || facility.state_code
  const parts = [facility.city, region, facility.country || facility.country_code].filter(
    (value) => {
      if (!value) return false
      return value.trim().length > 0
    }
  )

  return parts.join(', ')
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  // Fetch company data
  const { data: company } = await supabase
    .from('companies')
    .select(`
      company_name,
      description,
      logo_url,
      facilities (city, state, state_province, state_code, country, country_code),
      capabilities (capability_type),
      certifications (certification_type)
    `)
    .eq('slug', slug)
    .single()
  
  if (!company) {
    return {
      title: 'Company Not Found | CM Directory',
      description: 'The requested manufacturer profile could not be found.'
    }
  }
  
  // Type cast the company data
  type CompanyMetadata = {
    company_name: string
    description: string | null
    logo_url: string | null
    facilities: Array<{
      city: string | null
      state: string | null
      state_province: string | null
      state_code: string | null
      country: string | null
      country_code: string | null
    }> | null
    capabilities: Array<{ capability_type: string }> | null
    certifications: Array<{ certification_type: string }> | null
  }
  
  const typedCompany = company as unknown as CompanyMetadata
  
  // Build location string
  const primaryFacility = typedCompany.facilities?.[0]
  const location = buildLocationString(primaryFacility)
  
  // Get top capabilities
  const topCapabilities = typedCompany.capabilities
    ?.slice(0, 3)
    .map((c: { capability_type: string }) => c.capability_type)
    .join(', ') || ''
  
  const pageUrl = getCanonicalUrl(`/companies/${slug}`)

  const ogImages = typedCompany.logo_url
    ? [{ url: typedCompany.logo_url }]
    : [{ url: siteConfig.ogImage }]

  return {
    title: `${typedCompany.company_name} - Contract Manufacturer ${location ? `in ${location}` : ''}`,
    description: `${typedCompany.description || `${typedCompany.company_name} provides contract manufacturing services`}. Capabilities include ${topCapabilities}. View full profile, certifications, and contact information.`,

    // Open Graph
    openGraph: {
      title: typedCompany.company_name,
      description: typedCompany.description || `Contract manufacturing services by ${typedCompany.company_name}`,
      type: 'website',
      url: pageUrl,
      siteName: siteConfig.name,
      images: ogImages,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: typedCompany.company_name,
      description: typedCompany.description?.substring(0, 160),
      images: [typedCompany.logo_url ?? siteConfig.ogImage],
    },

    // Additional meta
    alternates: {
      canonical: pageUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}
