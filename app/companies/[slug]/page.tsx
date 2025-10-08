import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import type { CompanyWithRelations } from "@/types/company"
import { CompanySchema } from "@/components/CompanySchema"
import CompanyDetailClient from "./CompanyDetailClient"
import { getAbsoluteUrl, siteConfig } from "@/lib/config"

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  const { data: company } = await supabase
    .from("companies")
    .select(`
      company_name,
      description,
      facilities (city, state),
      capabilities (*),
      certifications (certification_type)
    `)
    .eq("slug", slug)
    .single()
  
  if (!company) {
    return {
      title: 'Company Not Found | CM Directory',
      description: 'The requested manufacturer profile could not be found.',
    }
  }
  
  // Type cast for metadata generation
  type CompanyMetadata = {
    company_name: string
    description: string | null
    facilities: Array<{ city: string | null; state: string | null }> | null
    capabilities: Array<{
      pcb_assembly_smt: boolean | null
      cable_harness_assembly: boolean | null
      box_build_assembly: boolean | null
    }> | null
    certifications: Array<{ certification_type: string }> | null
  }
  
  const typedCompany = company as unknown as CompanyMetadata
  
  const location = typedCompany.facilities?.[0] 
    ? `${typedCompany.facilities[0].city}, ${typedCompany.facilities[0].state}` 
    : ''
  
  // Get key capabilities for description
  const capabilities = []
  if (typedCompany.capabilities?.[0]) {
    const cap = typedCompany.capabilities[0]
    if (cap.pcb_assembly_smt) capabilities.push('SMT Assembly')
    if (cap.cable_harness_assembly) capabilities.push('Cable Assembly')
    if (cap.box_build_assembly) capabilities.push('Box Build')
  }
  
  const certifications = typedCompany.certifications?.map((c: { certification_type: string }) => c.certification_type).slice(0, 3).join(', ')
  
  const pageUrl = getAbsoluteUrl(`/companies/${slug}`)

  return {
    title: `${typedCompany.company_name} - Contract Manufacturer${location ? ` in ${location}` : ''} | CM Directory`,
    description: typedCompany.description ||
      `${typedCompany.company_name} is a contract manufacturer${location ? ` located in ${location}` : ''}. ${
        capabilities.length > 0 ? `Capabilities include ${capabilities.join(', ')}.` : ''
      } ${certifications ? `Certifications: ${certifications}.` : ''} View full profile and contact information.`,

    openGraph: {
      title: `${typedCompany.company_name} - Contract Manufacturer`,
      description: typedCompany.description || `Contract manufacturing services by ${typedCompany.company_name}`,
      type: 'website',
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: `${typedCompany.company_name} - Contract Manufacturer`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${typedCompany.company_name} - Contract Manufacturer`,
      description: typedCompany.description?.substring(0, 160),
      images: [siteConfig.ogImage],
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

  // Fetch all company data
  const { data: company } = await supabase
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

  if (!company) {
    notFound()
  }

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <CompanySchema company={company} />

      {/* Client Component for interactivity */}
      <CompanyDetailClient company={company} />
    </>
  )
}