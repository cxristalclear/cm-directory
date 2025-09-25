import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Capabilities, Certification, Facility } from '@/types/company'

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
    .single<MetadataCompany>()
  
  if (!company) {
    return {
      title: 'Company Not Found | CM Directory',
      description: 'The requested manufacturer profile could not be found.'
    }
  }
  
  // Build location string
  const primaryFacility = company.facilities?.[0]
  const locationParts = [primaryFacility?.city, primaryFacility?.state].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )
  const location = locationParts.join(', ')
  
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

  const certificationList = company.certifications?.map((cert) => cert.certification_type) ?? []
  const certifications = certificationList
    .filter((value) => typeof value === 'string' && value.length > 0)
    .slice(0, 3)
    .join(', ')

  return {
    title: `${company.company_name} - Contract Manufacturer ${location ? `in ${location}` : ''}`,
    description: `${company.description || `${company.company_name} provides contract manufacturing services`}. ${capabilitiesDescription} ${certifications ? `Certifications: ${certifications}.` : ''}View full profile, certifications, and contact information.`.trim(),
    
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

type MetadataCompany = {
  company_name: string
  description: string | null
  logo_url: string | null
  facilities: Array<Pick<Facility, 'city' | 'state'>> | null
  capabilities: Array<
    Pick<
      Capabilities,
      | 'pcb_assembly_smt'
      | 'pcb_assembly_through_hole'
      | 'cable_harness_assembly'
      | 'box_build_assembly'
      | 'prototyping'
    >
  > | null
  certifications: Array<Pick<Certification, 'certification_type'>> | null
}