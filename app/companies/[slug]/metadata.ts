import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getAbsoluteUrl, siteConfig } from '@/lib/config'

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
      facilities (city, state),
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
    facilities: Array<{ city: string | null; state: string | null }> | null
    capabilities: Array<{ capability_type: string }> | null
    certifications: Array<{ certification_type: string }> | null
  }
  
  const typedCompany = company as unknown as CompanyMetadata
  
  // Build location string
  const location = typedCompany.facilities?.[0] 
    ? `${typedCompany.facilities[0].city}, ${typedCompany.facilities[0].state}` 
    : ''
  
  // Get top capabilities
  const topCapabilities = typedCompany.capabilities
    ?.slice(0, 3)
    .map((c: { capability_type: string }) => c.capability_type)
    .join(', ') || ''
  
  const pageUrl = getAbsoluteUrl(`/companies/${slug}`)

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