import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

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
      facilities:facilities (city, state),
      capabilities:capabilities (
        pcb_assembly_smt,
        pcb_assembly_through_hole,
        cable_harness_assembly,
        box_build_assembly,
        prototyping
      ),
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
  
  // Build location string
  const location = company.facilities?.[0] 
    ? `${company.facilities[0].city}, ${company.facilities[0].state}` 
    : ''
  
  // Get top capabilities
  const capabilityRecord = company.capabilities?.[0]
  const capabilityLabels: string[] = []
  if (capabilityRecord?.pcb_assembly_smt) capabilityLabels.push('SMT Assembly')
  if (capabilityRecord?.pcb_assembly_through_hole) capabilityLabels.push('Through-Hole Assembly')
  if (capabilityRecord?.cable_harness_assembly) capabilityLabels.push('Cable Harness Assembly')
  if (capabilityRecord?.box_build_assembly) capabilityLabels.push('Box Build Assembly')
  if (capabilityRecord?.prototyping) capabilityLabels.push('Prototyping Services')
  const topCapabilities = capabilityLabels.slice(0, 3).join(', ')
  
  const capabilitiesDescription = topCapabilities ? `Capabilities include ${topCapabilities}.` : ''

  return {
    title: `${company.company_name} - Contract Manufacturer ${location ? `in ${location}` : ''}`,
    description: `${company.description || `${company.company_name} provides contract manufacturing services`}. ${capabilitiesDescription} View full profile, certifications, and contact information.`.trim(),
    
    // Open Graph
    openGraph: {
      title: company.company_name,
      description: company.description || `Contract manufacturing services by ${company.company_name}`,
      type: 'website',
      url: `https://yourdomain.com/companies/${slug}`,
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: company.company_name,
      description: company.description?.substring(0, 160),
    },
    
    // Additional meta
    alternates: {
      canonical: `https://yourdomain.com/companies/${slug}`,
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