import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import type { CompanyWithRelations } from "@/types/company"
import { CompanySchema } from "@/components/CompanySchema"
import CompanyDetailClient from "./CompanyDetailClient"

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
  
  const location = company.facilities?.[0] 
    ? `${company.facilities[0].city}, ${company.facilities[0].state}` 
    : ''
  
  // Get key capabilities for description
  const capabilities = []
  if (company.capabilities?.[0]) {
    const cap = company.capabilities[0]
    if (cap.pcb_assembly_smt) capabilities.push('SMT Assembly')
    if (cap.cable_harness_assembly) capabilities.push('Cable Assembly')
    if (cap.box_build_assembly) capabilities.push('Box Build')
  }
  
  const certifications = company.certifications?.map(c => c.certification_type).slice(0, 3).join(', ')
  
  return {
    title: `${company.company_name} - Contract Manufacturer${location ? ` in ${location}` : ''} | CM Directory`,
    description: company.description || 
      `${company.company_name} is a contract manufacturer${location ? ` located in ${location}` : ''}. ${
        capabilities.length > 0 ? `Capabilities include ${capabilities.join(', ')}.` : ''
      } ${certifications ? `Certifications: ${certifications}.` : ''} View full profile and contact information.`,
    
    openGraph: {
      title: `${company.company_name} - Contract Manufacturer`,
      description: company.description || `Contract manufacturing services by ${company.company_name}`,
      type: 'website',
      url: `https://yourdomain.com/companies/${slug}`,
      siteName: 'CM Directory',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${company.company_name} - Contract Manufacturer`,
      description: company.description?.substring(0, 160),
    },
    
    alternates: {
      canonical: `https://yourdomain.com/companies/${slug}`,
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