'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AiCompanyResearch from '@/components/admin/AiCompanyResearch'
import type { CompanyFormData } from '@/types/admin'
import type { Database } from '@/lib/database.types'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData, normalizeWebsiteUrl } from '@/lib/admin/utils'
import { geocodeFacilityToPoint } from '@/lib/admin/geocoding'
import { toast } from 'sonner'
import { prepareFacilityForDB, hasMinimumAddressData } from '@/lib/admin/addressCompat'

type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
type IndustryInsert = Database['public']['Tables']['industries']['Insert']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']

export default function AiResearchPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean) => {
    console.log('=== AI RESEARCH IMPORT STARTED ===')
    console.log('Company Name:', formData.company_name)
    console.log('Website URL:', formData.website_url)
    
    try {
      const validation = validateCompanyData(formData)
      if (!validation.valid) {
        toast.error(validation.errors.join(', '))
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // ============================================================================
      // CHECK FOR DUPLICATE COMPANY (by name OR website)
      // ============================================================================
      console.log('\n--- Checking for Duplicate Company ---')
      
      const normalizedWebsite = formData.website_url?.toLowerCase().trim()
      const normalizedName = formData.company_name.trim()

      // Check by company name
      const { data: existingByName } = await supabase
        .from('companies')
        .select('id, company_name, website_url')
        .ilike('company_name', normalizedName)
        .maybeSingle()

      // Check by website URL
      const { data: existingByWebsite } = normalizedWebsite ? await supabase
        .from('companies')
        .select('id, company_name, website_url')
        .ilike('website_url', normalizedWebsite)
        .maybeSingle() : { data: null }

      const existingCompany = existingByName || existingByWebsite
      let companyId: string

      if (existingCompany) {
        console.log(`✓ Found existing company: ${existingCompany.company_name} (ID: ${existingCompany.id})`)
        toast.info(`Company already exists: ${existingCompany.company_name}. Updating missing data...`)
        companyId = existingCompany.id
      } else {
        // Create new company
        console.log('No duplicate found. Creating new company...')
        let newSlug = generateSlug(formData.company_name)
        newSlug = await ensureUniqueSlug(supabase, newSlug)

        const companyInsert: CompanyInsert = {
          company_name: formData.company_name,
          dba_name: formData.dba_name || null,
          description: formData.description || null,
          website_url: normalizeWebsiteUrl(formData.website_url),
          year_founded: formData.year_founded || null,
          employee_count_range: formData.employee_count_range || null,
          annual_revenue_range: formData.annual_revenue_range || null,
          key_differentiators: formData.key_differentiators || null,
          slug: newSlug,
          is_verified: formData.is_verified || false,
          verified_until: formData.verified_until || null,
          is_active: !isDraft,
        }

        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .insert(companyInsert)
          .select('id')
          .single()

        if (companiesError) throw companiesError
        companyId = companiesData.id
        console.log('✓ Company created with ID:', companyId)
      }

      // Insert facilities
      if (formData.facilities && formData.facilities.length > 0) {
        const { data: existingFacilities } = await supabase
          .from('facilities')
          .select('id')
          .eq('company_id', companyId)

        if (!existingFacilities || existingFacilities.length === 0) {
          const facilitiesData: FacilityInsert[] = []

          for (const facility of formData.facilities) {
            let latitude = facility.latitude
            let longitude = facility.longitude

            if ((latitude == null || longitude == null) && hasMinimumAddressData(facility) && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
              try {
                console.log(`📍 Geocoding: ${facility.city}, ${facility.state || facility.state_province}`)
                const coordinates = await geocodeFacilityToPoint(facility)
                latitude = coordinates.latitude
                longitude = coordinates.longitude
                console.log(`✓ Geocoded to: ${latitude}, ${longitude}`)
              } catch (error) {
                console.warn('⚠️ Geocoding failed:', error)
              }
            } else if (!hasMinimumAddressData(facility)) {
              console.warn('⚠️ Skipping geocoding - insufficient address data:', facility)
            } else if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
              console.warn('⚠️ Skipping geocoding - missing NEXT_PUBLIC_MAPBOX_TOKEN')
            }
            // ✅ Use compatibility function to write to both columns
            facilitiesData.push(prepareFacilityForDB({
              company_id: companyId,
              facility_type: facility.facility_type,
              street_address: facility.street_address || null,
              city: facility.city || null,
              state: facility.state,
              state_province: facility.state_province,
              zip_code: facility.zip_code,
              postal_code: facility.postal_code,
              country: facility.country || 'US',
              is_primary: facility.is_primary || false,
              latitude: latitude || null,
              longitude: longitude || null,
            }))
          }

          const { error: facilitiesError } = await supabase
            .from('facilities')
            .insert(facilitiesData)

          if (facilitiesError) console.error('Facilities error:', facilitiesError)
        } else {
          console.log('⚠ Skipping: Company already has facilities')
        }
      }

      // Insert capabilities
      const hasCapabilities = formData.capabilities
        ? Object.values(formData.capabilities).filter(v => v !== null && v !== undefined && v !== false).length > 0
        : false

      if (hasCapabilities) {
        const { data: existing } = await supabase
          .from('capabilities')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (!existing) {
          const capabilitiesInsert: CapabilitiesInsert = {
            company_id: companyId,
            ...formData.capabilities,
          }

          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .insert(capabilitiesInsert)

          if (capabilitiesError) console.error('Capabilities error:', capabilitiesError)
        }
      }

      // Insert industries
      if (formData.industries && formData.industries.length > 0) {
        const { data: existingIndustries } = await supabase
          .from('industries')
          .select('industry_name')
          .eq('company_id', companyId)

        const existingNames = new Set(existingIndustries?.map(i => i.industry_name) || [])
        const newIndustries = formData.industries.filter(i => !existingNames.has(i.industry_name))

        if (newIndustries.length > 0) {
          const industriesInsert: IndustryInsert[] = newIndustries.map((i) => ({
            company_id: companyId,
            industry_name: i.industry_name,
          }))

          const { error: industriesError } = await supabase
            .from('industries')
            .insert(industriesInsert)

          if (industriesError) console.error('Industries error:', industriesError)
        }
      }

      // Insert certifications
      if (formData.certifications && formData.certifications.length > 0) {
        const { data: existingCertifications } = await supabase
          .from('certifications')
          .select('certification_type')
          .eq('company_id', companyId)

        const existingTypes = new Set(existingCertifications?.map(c => c.certification_type) || [])
        const newCertifications = formData.certifications.filter(c => !existingTypes.has(c.certification_type))

        if (newCertifications.length > 0) {
          const certificationsInsert: CertificationInsert[] = newCertifications.map((c) => ({
            company_id: companyId,
            certification_type: c.certification_type,
            certificate_number: c.certificate_number || null,
            status: c.status || 'Active',
            issued_date: c.issued_date || null,
            expiration_date: c.expiration_date || null,
          }))

          const { error: certificationsError } = await supabase
            .from('certifications')
            .insert(certificationsInsert)

          if (certificationsError) console.error('Certifications error:', certificationsError)
        }
      }

      // Insert technical specs
      const techSpecsCount = formData.technical_specs
        ? Object.values(formData.technical_specs).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (techSpecsCount > 0) {
        const { data: existing } = await supabase
          .from('technical_specs')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (!existing) {
          const technicalSpecsInsert: TechnicalSpecsInsert = {
            company_id: companyId,
            ...formData.technical_specs,
          }

          const { error: technicalSpecsError } = await supabase
            .from('technical_specs')
            .insert(technicalSpecsInsert)

          if (technicalSpecsError) console.error('Technical specs error:', technicalSpecsError)
        }
      }

      // Insert business info
      const businessInfoCount = formData.business_info
        ? Object.values(formData.business_info).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (businessInfoCount > 0) {
        const { data: existing } = await supabase
          .from('business_info')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (!existing) {
          const businessInfoInsert: BusinessInfoInsert = {
            company_id: companyId,
            ...formData.business_info,
          }

          const { error: businessInfoError } = await supabase
            .from('business_info')
            .insert(businessInfoInsert)

          if (businessInfoError) console.error('Business info error:', businessInfoError)
        }
      }

      await logCompanyChanges(
        supabase,
        companyId,
        [{ field_name: 'company_name', old_value: null, new_value: formData.company_name }],
        user.email || 'unknown',
        user.user_metadata?.full_name || user.email || 'Admin',
        'created'
      )

      console.log('=== AI RESEARCH IMPORT COMPLETED SUCCESSFULLY ===')
      toast.success('Company saved successfully!')
      
      // Do NOT redirect here - child component will call onAllCompaniesSaved callback when done
    } catch (error) {
      console.error('=== AI RESEARCH IMPORT FAILED ===')
      console.error('Error:', error)
      
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message: string }
        if (dbError.code === '23505') {
          toast.error('Database duplicate error. If this persists, try a slightly different company name.')
        } else {
          toast.error(`Database error: ${dbError.message}`)
        }
      } else {
        toast.error('Failed to save company. Check console for details.')
      }
    }
  }

  const handleAllCompaniesSaved = () => {
    // Called when ALL companies have been saved
    router.push('/admin/companies')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">🤖 AI Company Research</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Use AI to automatically research and populate company data
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/companies/add')}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Manual Entry Instead →
          </button>
        </div>
      </div>
      <AiCompanyResearch 
        onSaveCompany={handleSubmit} 
        onAllCompaniesSaved={handleAllCompaniesSaved} 
      />
    </div>
  )
}