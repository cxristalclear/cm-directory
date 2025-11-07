'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AiCompanyResearch from '@/components/admin/AiCompanyResearch'
import type { CompanyFormData } from '@/types/admin'
import type { Database, Json } from '@/lib/database.types'
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
type ResearchHistoryInsert = Database['public']['Tables']['company_research_history']['Insert']

export default function AiResearchPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean) => {
    console.log('=== AI RESEARCH IMPORT STARTED ===')
    console.log('Company Name:', formData.company_name)
    console.log('Original Website URL:', formData.website_url)
    
    try {
      // ⭐ NORMALIZE WEBSITE URL FIRST - before validation!
      const normalizedFormData = {
        ...formData,
        website_url: normalizeWebsiteUrl(formData.website_url),
      }
      
      console.log('Normalized Website URL:', normalizedFormData.website_url)

      // Now validate with the normalized URL
      const validation = validateCompanyData(normalizedFormData)
      if (!validation.valid) {
        toast.error(validation.errors.join(', '))
        // ⭐ DO NOT RETURN - let user know to edit and retry
        console.warn('Validation failed - user should edit:', validation.errors)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // ============================================================================
      // CHECK FOR DUPLICATE COMPANY (by name OR website)
      // ============================================================================
      console.log('\n--- Checking for Duplicate Company ---')
      
      const normalizedWebsite = normalizedFormData.website_url?.toLowerCase().trim()
      const normalizedName = normalizedFormData.company_name.trim()

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
        // Create new company with normalized URL
        console.log('No duplicate found. Creating new company...')
        let newSlug = generateSlug(normalizedFormData.company_name)
        newSlug = await ensureUniqueSlug(supabase, newSlug)

        const companyInsert: CompanyInsert = {
          company_name: normalizedFormData.company_name,
          dba_name: normalizedFormData.dba_name || null,
          description: normalizedFormData.description || null,
          website_url: normalizedFormData.website_url,
          year_founded: normalizedFormData.year_founded || null,
          employee_count_range: normalizedFormData.employee_count_range || null,
          annual_revenue_range: normalizedFormData.annual_revenue_range || null,
          key_differentiators: normalizedFormData.key_differentiators || null,
          slug: newSlug,
          is_verified: normalizedFormData.is_verified || false,
          verified_until: normalizedFormData.verified_until || null,
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

      // Insert or replace facilities
      if (normalizedFormData.facilities && normalizedFormData.facilities.length > 0) {
        const facilitiesData: FacilityInsert[] = []

        for (const facility of normalizedFormData.facilities) {
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

        const { error: deleteFacilitiesError } = await supabase
          .from('facilities')
          .delete()
          .eq('company_id', companyId)

        if (deleteFacilitiesError) {
          console.error('Facilities delete error:', deleteFacilitiesError)
        }

        const { error: facilitiesError } = await supabase
          .from('facilities')
          .insert(facilitiesData)

        if (facilitiesError) console.error('Facilities error:', facilitiesError)
      }

      // Insert capabilities
      const hasCapabilities = normalizedFormData.capabilities
        ? Object.values(normalizedFormData.capabilities).filter(v => v !== null && v !== undefined && v !== false).length > 0
        : false

      if (hasCapabilities) {
        const capabilitiesInsert: CapabilitiesInsert = {
          company_id: companyId,
          ...normalizedFormData.capabilities,
        }

        const { error: deleteCapabilitiesError } = await supabase
          .from('capabilities')
          .delete()
          .eq('company_id', companyId)

        if (deleteCapabilitiesError) {
          console.error('Capabilities delete error:', deleteCapabilitiesError)
        }

        const { error: capabilitiesError } = await supabase
          .from('capabilities')
          .insert(capabilitiesInsert)

        if (capabilitiesError) console.error('Capabilities error:', capabilitiesError)
      }

      // Insert industries
      if (normalizedFormData.industries && normalizedFormData.industries.length > 0) {
        const industriesInsert: IndustryInsert[] = normalizedFormData.industries.map((i) => ({
          company_id: companyId,
          industry_name: i.industry_name,
        }))

        const { error: deleteIndustriesError } = await supabase
          .from('industries')
          .delete()
          .eq('company_id', companyId)

        if (deleteIndustriesError) {
          console.error('Industries delete error:', deleteIndustriesError)
        }

        const { error: industriesError } = await supabase
          .from('industries')
          .insert(industriesInsert)

        if (industriesError) console.error('Industries error:', industriesError)
      }

      // Insert certifications
      if (normalizedFormData.certifications && normalizedFormData.certifications.length > 0) {
        const certificationsInsert: CertificationInsert[] = normalizedFormData.certifications.map((c) => ({
          company_id: companyId,
          certification_type: c.certification_type,
          certificate_number: c.certificate_number || null,
          status: c.status || 'Active',
          issued_date: c.issued_date || null,
          expiration_date: c.expiration_date || null,
        }))

        const { error: deleteCertificationsError } = await supabase
          .from('certifications')
          .delete()
          .eq('company_id', companyId)

        if (deleteCertificationsError) {
          console.error('Certifications delete error:', deleteCertificationsError)
        }

        const { error: certificationsError } = await supabase
          .from('certifications')
          .insert(certificationsInsert)

        if (certificationsError) console.error('Certifications error:', certificationsError)
      }

      // Insert technical specs
      const techSpecsCount = normalizedFormData.technical_specs
        ? Object.values(normalizedFormData.technical_specs).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (techSpecsCount > 0) {
        const technicalSpecsInsert: TechnicalSpecsInsert = {
          company_id: companyId,
          ...normalizedFormData.technical_specs,
        }

        const { error: deleteTechSpecsError } = await supabase
          .from('technical_specs')
          .delete()
          .eq('company_id', companyId)

        if (deleteTechSpecsError) {
          console.error('Technical specs delete error:', deleteTechSpecsError)
        }

        const { error: technicalSpecsError } = await supabase
          .from('technical_specs')
          .insert(technicalSpecsInsert)

        if (technicalSpecsError) console.error('Technical specs error:', technicalSpecsError)
      }

      // Insert business info
      const businessInfoCount = normalizedFormData.business_info
        ? Object.values(normalizedFormData.business_info).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (businessInfoCount > 0) {
        const businessInfoInsert: BusinessInfoInsert = {
          company_id: companyId,
          ...normalizedFormData.business_info,
        }

        const { error: deleteBusinessInfoError } = await supabase
          .from('business_info')
          .delete()
          .eq('company_id', companyId)

        if (deleteBusinessInfoError) {
          console.error('Business info delete error:', deleteBusinessInfoError)
        }

        const { error: businessInfoError } = await supabase
          .from('business_info')
          .insert(businessInfoInsert)

        if (businessInfoError) console.error('Business info error:', businessInfoError)
      }

      // Log research snapshot
      const researchSnapshot = JSON.parse(JSON.stringify(normalizedFormData)) as Json
      const historyInsert: ResearchHistoryInsert = {
        company_id: companyId,
        company_name: normalizedFormData.company_name,
        website_url: normalizedFormData.website_url || null,
        research_snapshot: researchSnapshot,
        research_summary: normalizedFormData.description || normalizedFormData.key_differentiators || null,
        research_notes: normalizedFormData.key_differentiators || null,
        data_confidence: null,
        source: 'ai_research',
        created_by_email: user.email || 'unknown',
        created_by_name: user.user_metadata?.full_name || user.email || 'Admin',
        enrichment_snapshot: null,
      }

      const { error: historyError } = await supabase
        .from('company_research_history')
        .insert(historyInsert)

      if (historyError) {
        console.error('Research history insert error:', historyError)
      }

      await logCompanyChanges(
        supabase,
        companyId,
        [{ field_name: 'company_name', old_value: null, new_value: normalizedFormData.company_name }],
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
      
      let errorMessage = 'Failed to save company. '
      
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message: string }
        if (dbError.code === '23505') {
          errorMessage += 'Database duplicate error. If this persists, try a slightly different company name.'
        } else {
          errorMessage += `Database error: ${dbError.message}`
        }
      } else if (error instanceof Error) {
        errorMessage += error.message
      }
      
      // ⭐ CRITICAL: Show error WITHOUT redirecting - user can edit and retry
      toast.error(errorMessage + ' Please edit the data and try again.')
      console.log('Error shown to user - they can edit and retry without losing research data')
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
