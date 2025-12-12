import { cache } from "react"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import type { CompanyWithRelations } from "@/types/company"
import { CompanySchema } from "@/components/CompanySchema"
import CompanyDetailClient from "./CompanyDetailClient"
import Navbar from "@/components/navbar"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { isValidCompanySlug } from "@/lib/utils/validation"

const siteName = siteConfig.name

// Cached fetch to avoid duplicate Supabase queries between metadata and page render
const fetchCompanyBySlug = cache(async (slug: string) => {
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  
  // Validate slug format before querying database
  if (!isValidCompanySlug(slug)) {
    return {
      title: `Company Not Found | ${siteName}`,
      description: 'The requested manufacturer profile could not be found.',
    }
  }
  
  const { data: company } = await fetchCompanyBySlug(slug)
  
  if (!company) {
    return {
      title: `Company Not Found | ${siteName}`,
      description: 'The requested manufacturer profile could not be found.',
    }
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
  
  const pageUrl = getCanonicalUrl(`/companies/${slug}`)
  const titleLocation = location ? ` in ${location}` : ''
  const locationDetail = location ? ` located in ${location}` : ''
  const descriptionCapabilities = capabilities.length > 0 ? `Capabilities include ${capabilities.join(', ')}.` : ''
  const descriptionCertifications = certifications ? `Certifications: ${certifications}.` : ''
  const defaultDescription = [
    `${typedCompany.company_name} is a contract manufacturer${locationDetail}.`,
    descriptionCapabilities,
    descriptionCertifications,
    'View full profile and contact information.',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    title: `${typedCompany.company_name} - Contract Manufacturer${titleLocation} | ${siteName}`,
    description: typedCompany.description || defaultDescription,

    openGraph: {
      title: `${typedCompany.company_name} - Contract Manufacturer`,
      description: typedCompany.description || `Contract manufacturing services by ${typedCompany.company_name}`,
      type: 'website',
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: logoUrl || siteConfig.ogImage,
          alt: `${typedCompany.company_name} - Contract Manufacturer`,
        },
      ],
    },

    alternates: {
      canonical: pageUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  }
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
