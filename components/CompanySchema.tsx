import { resolveCompanyCanonicalUrl } from '@/lib/canonical'
import { formatCountryLabel } from '@/utils/locationFilters'
import type { CompanySocialLink, CompanyWithRelations } from '@/types/company'

type CompanySchemaProps = {
  company: CompanyWithRelations
  /** Optional override for the canonical profile URL */
  canonicalUrl?: string
}

type CompanySchemaInput = Pick<
  CompanyWithRelations,
  | 'slug'
  | 'cms_metadata'
  | 'website_url'
  | 'company_name'
  | 'description'
  | 'logo_url'
  | 'year_founded'
  | 'employee_count_range'
  | 'social_links'
  | 'facilities'
  | 'contacts'
  | 'capabilities'
  | 'certifications'
  | 'industries'
>

type CredentialJsonLd = {
  '@type': 'EducationalOccupationalCredential'
  name: string
  credentialCategory: 'certification'
  datePublished?: string
  expires?: string
  credentialStatus?: string
}

type IndustryJsonLd = {
  '@type': 'Text'
  name: string
}

const uniqueStrings = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>()
  for (const value of values) {
    if (!value) continue
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
  }
  return Array.from(seen)
}

const extractVerifiedSocialUrls = (links?: CompanySocialLink[] | null): string[] => {
  if (!links) return []
  return links
    .filter((link) => {
      if (!link || typeof link.url !== 'string') return false
      const verifiedFlag = link.is_verified ?? link.verified
      return Boolean(verifiedFlag)
    })
    .map((link) => link.url)
}

/** Builds JSON-LD structured data for a company */
export const buildCompanyJsonLd = (
  company: CompanySchemaInput,
  canonicalUrl?: string,
) => {
  const canonicalProfileUrl = resolveCompanyCanonicalUrl(company, canonicalUrl)
  const officialSiteUrl = company.website_url.trim() || undefined
  const profileUrl = canonicalProfileUrl ?? officialSiteUrl

  const combinedSocialLinks = [
    ...(company.cms_metadata?.social_links ?? []),
    ...(company.social_links ?? []),
  ]

  const verifiedSocialUrls = uniqueStrings(extractVerifiedSocialUrls(combinedSocialLinks))
  const sameAs = uniqueStrings([officialSiteUrl, ...verifiedSocialUrls])

  const primaryFacility =
    company.facilities?.find((facility) => facility?.is_primary) ?? company.facilities?.[0]

  const address = primaryFacility
    ? (() => {
        const region = primaryFacility.state_province || primaryFacility.state || undefined
        const postal = primaryFacility.postal_code || primaryFacility.zip_code || undefined
        const countryLabel =
          primaryFacility.country ||
          (primaryFacility.country_code ? formatCountryLabel(primaryFacility.country_code) : undefined)

        const hasAddressFields =
          Boolean(primaryFacility.street_address) ||
          Boolean(primaryFacility.city) ||
          Boolean(region) ||
          Boolean(postal) ||
          Boolean(countryLabel)

        if (!hasAddressFields) {
          return undefined
        }

        return {
          '@type': 'PostalAddress',
          ...(primaryFacility.street_address && { streetAddress: primaryFacility.street_address }),
          ...(primaryFacility.city && { addressLocality: primaryFacility.city }),
          ...(region && { addressRegion: region }),
          ...(postal && { postalCode: postal }),
          ...(countryLabel && { addressCountry: countryLabel }),
        }
      })()
    : undefined

  const primaryContact =
    company.contacts?.find((contact) => contact?.is_primary) ?? company.contacts?.[0]

  const contactDetails = primaryContact
    ? {
        ...(primaryContact.phone && { telephone: primaryContact.phone }),
        ...(primaryContact.email && { email: primaryContact.email }),
        ...(primaryContact.full_name && { name: primaryContact.full_name }),
      }
    : null

  const contactPoint = contactDetails && Object.keys(contactDetails).length > 0
    ? {
        '@type': 'ContactPoint',
        contactType: 'sales',
        ...contactDetails,
      }
    : undefined

  const capabilityLabels = new Set<string>()
  company.capabilities?.forEach((cap) => {
    if (!cap) return
    if (cap.pcb_assembly_smt) capabilityLabels.add('SMT PCB Assembly')
    if (cap.pcb_assembly_through_hole) capabilityLabels.add('Through-Hole PCB Assembly')
    if (cap.pcb_assembly_fine_pitch) capabilityLabels.add('Fine Pitch Assembly')
    if (cap.cable_harness_assembly) capabilityLabels.add('Cable & Harness Assembly')
    if (cap.box_build_assembly) capabilityLabels.add('Box Build Assembly')
    if (cap.prototyping) capabilityLabels.add('Prototyping Services')
    if (cap.low_volume_production) capabilityLabels.add('Low Volume Production')
    if (cap.medium_volume_production) capabilityLabels.add('Medium Volume Production')
    if (cap.high_volume_production) capabilityLabels.add('High Volume Production')
  })

  const credentials = company.certifications
    ?.map((cert): CredentialJsonLd | null => {
      if (!cert?.certification_type) return null
      return {
        '@type': 'EducationalOccupationalCredential',
        name: cert.certification_type,
        credentialCategory: 'certification',
        ...(cert.issued_date && { datePublished: cert.issued_date }),
        ...(cert.expiration_date && { expires: cert.expiration_date }),
        ...(cert.status && { credentialStatus: cert.status }),
      }
    })
    .filter((cert): cert is CredentialJsonLd => Boolean(cert))

  const industries = company.industries
    ?.map((ind): IndustryJsonLd | null => {
      if (!ind?.industry_name) return null
      return {
        '@type': 'Text',
        name: ind.industry_name,
      }
    })
    .filter((industry): industry is IndustryJsonLd => Boolean(industry))

  const cmsLogoUrl = company.cms_metadata?.logo?.url
  const logoUrl = cmsLogoUrl || company.logo_url || undefined

  const imageUrls = uniqueStrings([
    company.cms_metadata?.hero_image?.url,
    ...(company.cms_metadata?.gallery_images?.map((asset) => asset?.url) ?? []),
    logoUrl,
  ])

  const imageField = imageUrls.length === 0
    ? undefined
    : imageUrls.length === 1
      ? imageUrls[0]
      : imageUrls

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': profileUrl,
    url: profileUrl,
    name: company.company_name,
    description: company.description ?? undefined,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(imageField ? { image: imageField } : {}),
    ...(address ? { address } : {}),
    ...(contactPoint ? { contactPoint } : {}),
    ...(company.year_founded ? { foundingDate: company.year_founded } : {}),
    ...(company.employee_count_range
      ? {
          numberOfEmployees: {
            '@type': 'QuantitativeValue',
            value: company.employee_count_range,
          },
        }
      : {}),
    ...(capabilityLabels.size > 0 ? { knowsAbout: Array.from(capabilityLabels) } : {}),
    ...(credentials && credentials.length > 0 ? { hasCredential: credentials } : {}),
    ...(industries && industries.length > 0 ? { areaServed: industries } : {}),
  }

  return JSON.parse(JSON.stringify(schema)) as typeof schema
}

export function CompanySchema({ company, canonicalUrl }: CompanySchemaProps) {
  const schema = buildCompanyJsonLd(company, canonicalUrl)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
