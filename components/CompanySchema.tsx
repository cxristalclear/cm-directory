import type { CompanyWithRelations } from '@/types/company'

export function CompanySchema({ company }: { company: CompanyWithRelations }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.company_name,
    url: company.website_url,
    description: company.description,
    
    // Address from primary facility
    address: company.facilities?.[0] ? {
      '@type': 'PostalAddress',
      streetAddress: company.facilities[0].street_address,
      addressLocality: company.facilities[0].city,
      addressRegion: company.facilities[0].state,
      postalCode: company.facilities[0].zip_code,
      addressCountry: company.facilities[0].country || 'US',
    } : undefined,
    
    // Contact point
    contactPoint: company.contacts?.[0] ? {
      '@type': 'ContactPoint',
      telephone: company.contacts[0].phone,
      email: company.contacts[0].email,
      contactType: 'sales',
      name: company.contacts[0].full_name,
    } : undefined,
    
    // Additional organization properties
    ...(company.year_founded && { foundingDate: company.year_founded }),
    
    // Employee count
    ...(company.employee_count_range && {
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: company.employee_count_range,
      }
    }),
    
    // Capabilities as services/expertise
    knowsAbout: company.capabilities?.flatMap((cap) => {
      const capabilities: string[] = []
      if (cap.pcb_assembly_smt) capabilities.push('SMT PCB Assembly')
      if (cap.pcb_assembly_through_hole) capabilities.push('Through-Hole PCB Assembly')
      if (cap.pcb_assembly_fine_pitch) capabilities.push('Fine Pitch Assembly')
      if (cap.cable_harness_assembly) capabilities.push('Cable & Harness Assembly')
      if (cap.box_build_assembly) capabilities.push('Box Build Assembly')
      if (cap.prototyping) capabilities.push('Prototyping Services')
      if (cap.low_volume_production) capabilities.push('Low Volume Production')
      if (cap.medium_volume_production) capabilities.push('Medium Volume Production')
      if (cap.high_volume_production) capabilities.push('High Volume Production')
      return capabilities
    }),
    
    // Certifications
    hasCredential: company.certifications?.map((cert) => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert.certification_type,
      credentialCategory: 'certification',
      ...(cert.issued_date && { datePublished: cert.issued_date }),
      ...(cert.expiration_date && { expires: cert.expiration_date }),
      ...(cert.status && { credentialStatus: cert.status }),
    })),
    
    // Industries served
    areaServed: company.industries?.map(ind => ({
      '@type': 'Text',
      name: ind.industry_name
    })),
  }
  
  // Remove undefined values for cleaner JSON
  const cleanSchema = JSON.parse(JSON.stringify(schema))
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  )
}