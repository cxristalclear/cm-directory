import { cache } from "react"
import { createClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import type { CompanyWithRelations } from "@/types/company"
import { CompanySchema } from "@/components/CompanySchema"
import CompanyDetailClient from "./CompanyDetailClient"
import Navbar from "@/components/navbar"
import { siteConfig } from "@/lib/config"
import { isValidCompanySlug } from "@/lib/utils/validation"
import { buildMetadata, buildRobots } from "@/lib/seo"

// Cached fetch to avoid duplicate Supabase queries between metadata and page render
const fetchCompanyBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  const result = await supabase
    .from("companies")
    .select(`
      *,
      facilities (*),
      capabilities (*),
      industries (industry_name),
      certifications (*),
      technical_specs (*),
      business_info (*),
      contacts (*)
    `)
    .eq("slug", slug)
    .single<CompanyWithRelations>()
    if (result.error && result.error.code !== 'PGRST116') {
    console.error('Error fetching company:', result.error)
    throw new Error('Failed to fetch company data')
  }
  return result
})

/**
 * Truncates description to optimal SEO length (150-160 characters)
 * while preserving complete sentences when possible.
 */
function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description
  
  // Try to truncate at sentence boundary
  const truncated = description.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastExclamation = truncated.lastIndexOf('!')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return description.substring(0, lastSentenceEnd + 1)
  }
  
  // Fallback to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return description.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  
  // Validate slug format before querying database
  if (!isValidCompanySlug(slug)) {
    return buildMetadata({
      title: 'Company Not Found',
      description: 'The requested manufacturer profile could not be found.',
      canonicalPath: `/companies/${slug}`,
      robots: buildRobots({ index: false, follow: false }),
    })
  }
  
  const { data: company } = await fetchCompanyBySlug(slug)
  
  if (!company) {
    return buildMetadata({
      title: 'Company Not Found',
      description: 'The requested manufacturer profile could not be found.',
      canonicalPath: `/companies/${slug}`,
      robots: buildRobots({ index: false, follow: false }),
    })
  }
  
  // Type cast for metadata generation
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
    capabilities: Array<{
      pcb_assembly_smt: boolean | null
      cable_harness_assembly: boolean | null
      box_build_assembly: boolean | null
    }> | null
    certifications: Array<{ certification_type: string }> | null
  }
  
  const typedCompany = company as unknown as CompanyMetadata
  
  const [primaryFacility] = typedCompany.facilities ?? []
  const region = primaryFacility
    ? primaryFacility.state_province || primaryFacility.state
    : null
  const location = primaryFacility
    ? [
        primaryFacility.city,
        region,
        primaryFacility.country,
      ]
        .filter(part => Boolean(part && part.trim()))
        .join(", ")
    : ""
  // TODO: upstream facility data should include full state/country names consistently to avoid empty segments
  
  // Get key capabilities for description
  const capabilities = []
  const [primaryCapability] = typedCompany.capabilities ?? []
  if (primaryCapability) {
    if (primaryCapability.pcb_assembly_smt) capabilities.push('SMT Assembly')
    if (primaryCapability.cable_harness_assembly) capabilities.push('Cable Assembly')
    if (primaryCapability.box_build_assembly) capabilities.push('Box Build')
  }
  
  const certifications = typedCompany.certifications?.map((c: { certification_type: string }) => c.certification_type).slice(0, 3).join(', ')
  const logoUrl = typedCompany.logo_url?.trim() || null
  
  const titleLocation = location ? ` in ${location}` : ''
  
  // Build optimized description (150-160 chars for SEO)
  const locationDetail = location ? ` located in ${location}` : ''
  const descriptionCapabilities = capabilities.length > 0 ? `Capabilities: ${capabilities.join(', ')}.` : ''
  const descriptionCertifications = certifications ? `Certified: ${certifications}.` : ''
  
  const defaultDescription = [
    `${typedCompany.company_name} is a contract manufacturer${locationDetail}.`,
    descriptionCapabilities,
    descriptionCertifications,
    'View profile and contact information.',
  ]
    .filter(Boolean)
    .join(' ')
  
  // Use company description if available, otherwise use default
  const rawDescription = typedCompany.description || defaultDescription
  const description = truncateDescription(rawDescription)
  
  // Title uses template from layout.tsx (site name will be appended automatically)
  const title = `${typedCompany.company_name} - Contract Manufacturer${titleLocation}`
  const ogTitle = `${typedCompany.company_name} - Contract Manufacturer`
  const ogDescription = typedCompany.description 
    ? truncateDescription(typedCompany.description)
    : `Contract manufacturing services by ${typedCompany.company_name}${locationDetail}.`

  // Extract keywords for SEO from company data
  const keywords = [
    typedCompany.company_name,
    'contract manufacturer',
    'electronics manufacturing',
    ...capabilities,
    ...(certifications ? certifications.split(', ') : []),
    ...(location ? [location.split(', ')[0], location.split(', ')[1]].filter(Boolean) : []),
    'PCB assembly',
    'SMT assembly',
    'box build',
    'cable assembly',
  ].filter(Boolean).slice(0, 15) // Limit to 15 keywords

  const ogImageUrl = logoUrl || siteConfig.ogImage

  return buildMetadata({
    title,
    description,
    canonicalPath: `/companies/${slug}`,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImageUrl,
          alt: `${typedCompany.company_name} - Contract Manufacturer`,
          width: 1200,
          height: 630,
        },
      ],
    },
    robots: buildRobots({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    }),
  })
}

// Main page component - Server Component
export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Validate slug format before querying database
  if (!isValidCompanySlug(slug)) {
    notFound()
  }

  // Fetch all company data
  const { data: company } = await fetchCompanyBySlug(slug)

  if (!company) {
    notFound()
  }

  return (
    <>
      <Navbar />
      {/* JSON-LD Schema for SEO */}
      <CompanySchema company={company} />

      {/* Client Component for interactivity */}
      <CompanyDetailClient company={company} />
    </>
  )
}
