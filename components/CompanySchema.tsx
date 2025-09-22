
export function CompanySchema({ company }: { company: CompanyWithRelations }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.company_name,
    url: company.website_url,
    description: company.description,
    
    // Address
    address: company.facilities?.[0] ? {
      '@type': 'PostalAddress',
      streetAddress: company.facilities[0].address_line1,
      addressLocality: company.facilities[0].city,
      addressRegion: company.facilities[0].state,
      postalCode: company.facilities[0].postal_code,
      addressCountry: 'US',
    } : undefined,
    
    // Contact
    contactPoint: company.contacts?.[0] ? {
      '@type': 'ContactPoint',
      telephone: company.contacts[0].phone,
      email: company.contacts[0].email,
      contactType: 'sales',
    } : undefined,
    
    // Additional properties
    foundingDate: company.year_founded,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: company.employee_count_range,
    },
    
    // Industry/Service schema
    knowsAbout: company.capabilities?.map(c => c.capability_type),
    hasCredential: company.certifications?.map(c => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.certification_type,
      credentialCategory: 'certification',
    })),
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}