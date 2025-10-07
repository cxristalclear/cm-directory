import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import EditCompanyForm from '@/components/admin/EditCompanyForm'
import type { CompanyWithRelations } from '@/types/company'
import type { 
  Company, 
  Facility as DBFacility,
  Capabilities as DBCapabilities,
  Industry as DBIndustry,
  Certification as DBCertification,
  TechnicalSpecs as DBTechnicalSpecs,
  BusinessInfo as DBBusinessInfo
} from '@/lib/supabase'
import type { 
  Facility, 
  Capabilities, 
  Industry, 
  Certification, 
  TechnicalSpecs, 
  BusinessInfo 
} from '@/types/company'

// Type for the raw query result from database
type DatabaseCompanyWithRelations = Company & {
  facilities: DBFacility[] | null
  capabilities: DBCapabilities[] | null
  industries: DBIndustry[] | null
  certifications: DBCertification[] | null
  technical_specs: DBTechnicalSpecs[] | null
  business_info: DBBusinessInfo[] | null
}

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // Fetch company with all related data
  const { data: companyRaw, error } = await supabase
    .from('companies')
    .select(
      `
      *,
      facilities(*),
      capabilities(*),
      industries(*),
      certifications(*),
      technical_specs(*),
      business_info(*)
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !companyRaw) {
    notFound()
  }

  // Cast the raw data to the database type
  const dbCompany = companyRaw as unknown as DatabaseCompanyWithRelations

  // Transform to match the CompanyWithRelations interface expected by the form
  const company: CompanyWithRelations = {
    ...dbCompany,
    name: dbCompany.company_name, // Add the 'name' field that the form expects
    // Transform facilities with proper location type
    facilities: dbCompany.facilities?.map(f => ({
      ...f,
      location: f.location as Facility['location']
    })) as Facility[] | undefined,
    // Transform capabilities directly (no type conflicts)
    capabilities: dbCompany.capabilities as Capabilities[] | undefined,
    // Transform industries directly (no type conflicts)
    industries: dbCompany.industries as Industry[] | undefined,
    // Transform certifications directly (no type conflicts)
    certifications: dbCompany.certifications as Certification[] | undefined,
    // Transform technical_specs with proper additional_specs type
    technical_specs: dbCompany.technical_specs?.map(ts => ({
      ...ts,
      additional_specs: ts.additional_specs as TechnicalSpecs['additional_specs']
    })) as TechnicalSpecs[] | undefined,
    // Transform business_info directly (no type conflicts)
    business_info: dbCompany.business_info as BusinessInfo[] | undefined,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update company profile information
        </p>
        {company.updated_at && (
          <p className="mt-1 text-xs text-gray-400">
            Last modified: {new Date(company.updated_at).toLocaleString()}
          </p>
        )}
      </div>

      <EditCompanyForm company={company} />
    </div>
  )
}