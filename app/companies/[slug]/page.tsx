import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import type {
  Capabilities,
  Certification,
  CompanyWithRelations,
  Facility,
} from "@/types/company"
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
    .eq("slug", slug)
    .single<MetadataCompany>()

  if (!company) {
    return {
      title: 'Company Not Found | CM Directory',
      description: 'The requested manufacturer profile could not be found.',
    }
  }

  const primaryFacility = company.facilities?.[0]
  const locationParts = [primaryFacility?.city, primaryFacility?.state].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  )
  const location = locationParts.join(', ')

  // Get key capabilities for description
  const capabilities: string[] = []
  const capabilityRecord = company.capabilities?.[0]
  if (capabilityRecord?.pcb_assembly_smt) capabilities.push('SMT Assembly')
  if (capabilityRecord?.pcb_assembly_through_hole) capabilities.push('Through-Hole Assembly')
  if (capabilityRecord?.cable_harness_assembly) capabilities.push('Cable Assembly')
  if (capabilityRecord?.box_build_assembly) capabilities.push('Box Build')
  if (capabilityRecord?.prototyping) capabilities.push('Prototyping')

  const certificationList = company.certifications?.map((cert) => cert.certification_type) ?? []
  const certifications = certificationList
    .filter((value) => typeof value === 'string' && value.length > 0)
    .slice(0, 3)
    .join(', ')
  
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
      id,
      company_name,
      slug,
      dba_name,
      description,
      website_url,
      year_founded,
      employee_count_range,
      annual_revenue_range,
      key_differentiators,
      is_active,
      is_verified,
      logo_url,
      facilities:facilities (
        id,
        facility_type,
        street_address,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        is_primary
      ),
      capabilities:capabilities (
        id,
        pcb_assembly_smt,
        pcb_assembly_through_hole,
        pcb_assembly_fine_pitch,
        cable_harness_assembly,
        box_build_assembly,
        prototyping,
        low_volume_production,
        medium_volume_production,
        high_volume_production
      ),
      industries:industries (
        id,
        industry_name
      ),
      certifications:certifications (
        id,
        certification_type,
        status,
        certificate_number,
        issued_date,
        expiration_date
      ),
      technical_specs:technical_specs (
        id,
        max_pcb_layers,
        max_pcb_size_inches,
        smallest_component_size,
        finest_pitch_capability,
        smt_placement_accuracy
      ),
      business_info:business_info (
        id,
        min_order_qty,
        prototype_lead_time,
        production_lead_time,
        payment_terms
      ),
      contacts:contacts (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq("slug", slug)
    .single<CompanyWithRelations>()

  if (!company) {
    notFound()
  }

  const typedCompany: CompanyWithRelations = company

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <CompanySchema company={typedCompany} />

      {/* Client Component for interactivity */}
      <CompanyDetailClient company={typedCompany} />
    </>
  )
}

type MetadataCompany = {
  company_name: string
  description: string | null
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