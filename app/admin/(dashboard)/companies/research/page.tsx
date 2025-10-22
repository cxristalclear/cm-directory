'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AiCompanyResearch from '@/components/admin/AiCompanyResearch'
import type { CompanyFormData } from '@/types/admin'
import type { Database } from '@/lib/database.types'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData } from '@/lib/admin/utils'
import { geocodeFacilityToPoint, GeocodeFacilityError } from '@/lib/admin/geocoding'
import { toast } from 'sonner'

type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
type IndustryInsert = Database['public']['Tables']['industries']['Insert']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']

export default function AiResearchPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean) => {
    setLoading(true)
    
    // ============================================================================
    // COMPREHENSIVE LOGGING - See what AI is actually returning
    // ============================================================================
    console.log('=== AI RESEARCH IMPORT STARTED ===')
    console.log('Company Name:', formData.company_name)
    console.log('Website URL:', formData.website_url)
    console.log('Capabilities:', formData.capabilities)
    console.log('Certifications:', formData.certifications)
    console.log('Industries:', formData.industries)
    console.log('Technical Specs:', formData.technical_specs)
    console.log('Business Info:', formData.business_info)
    console.log('Facilities:', formData.facilities)
    
    try {
      // Validate data
      const validation = validateCompanyData(formData)
      if (!validation.valid) {
        toast.error(validation.errors.join(', '))
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // ============================================================================
      // CHECK FOR DUPLICATE COMPANY (by name OR website)
      // ============================================================================
      console.log('Checking for duplicates...')
      
      const normalizedWebsite = formData.website_url?.toLowerCase().trim()
      const normalizedName = formData.company_name.trim()

      // Check by company name first (since there's a unique constraint on it)
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
        const baseSlug = generateSlug(formData.company_name)
        const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug)

        const companyInsert: CompanyInsert = {
          company_name: formData.company_name,
          dba_name: formData.dba_name || null,
          slug: uniqueSlug,
          description: formData.description || null,
          website_url: formData.website_url || '',
          year_founded: formData.year_founded || null,
          employee_count_range: formData.employee_count_range || null,
          annual_revenue_range: formData.annual_revenue_range || null,
          key_differentiators: formData.key_differentiators || null,
          is_active: !isDraft,
          is_verified: formData.is_verified || false,
          verified_until: formData.verified_until || null,
        }

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert(companyInsert)
          .select()
          .single()

        if (companyError) {
          console.error('Company insert error:', companyError)
          throw companyError
        }
        if (!company) throw new Error('Company creation failed')
        
        companyId = company.id
        console.log('✓ Company created with ID:', companyId)
      }

      // ============================================================================
      // INSERT FACILITIES (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Facilities ---')
      if (formData.facilities && formData.facilities.length > 0) {
        console.log(`Found ${formData.facilities.length} facilities to process`)
        
        const { data: existingFacilities } = await supabase
          .from('facilities')
          .select('id')
          .eq('company_id', companyId)

        if (existingFacilities && existingFacilities.length > 0) {
          console.log(`⚠ Skipping: ${existingFacilities.length} facilities already exist`)
        } else {
          const facilities = formData.facilities
          const baseFacilities: FacilityInsert[] = facilities.map((f) => ({
            company_id: companyId,
            facility_type: f.facility_type,
            street_address: f.street_address || null,
            city: f.city || null,
            state: f.state || null,
            zip_code: f.zip_code || null,
            country: f.country || null,
            is_primary: f.is_primary || false,
            latitude: null,
            longitude: null,
          }))

          console.log('Geocoding facilities...')
          const geocodingResults = await Promise.allSettled(
            facilities.map((facility) => geocodeFacilityToPoint(facility))
          )

          const facilitiesInsert: FacilityInsert[] = baseFacilities.map((baseFacility, index) => {
            const geocodeResult = geocodingResults[index]
            if (geocodeResult?.status === 'fulfilled') {
              const { latitude, longitude } = geocodeResult.value
              return { ...baseFacility, latitude, longitude }
            }
            if (geocodeResult?.status === 'rejected') {
              console.warn(`Failed to geocode facility ${index + 1}:`, geocodeResult.reason)
            }
            return baseFacility
          })

          console.log('Inserting facilities...')
          const { error: facilitiesError } = await supabase
            .from('facilities')
            .insert(facilitiesInsert)

          if (facilitiesError) {
            console.error('❌ Facilities insert error:', facilitiesError)
          } else {
            console.log('✓ Facilities inserted successfully')
          }
        }
      } else {
        console.log('⚠ WARNING: No facilities data received from AI')
      }

      // ============================================================================
      // INSERT CAPABILITIES (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Capabilities ---')
      
      const hasCapabilities = formData.capabilities && 
        Object.values(formData.capabilities).some(v => v === true)
      
      console.log('Has capability data?', hasCapabilities)
      console.log('Capabilities object:', formData.capabilities)
      
      if (hasCapabilities) {
        const { data: existing } = await supabase
          .from('capabilities')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (existing) {
          console.log('⚠ Skipping: Capabilities already exist')
        } else {
          const capabilitiesInsert: CapabilitiesInsert = {
            company_id: companyId,
            ...formData.capabilities,
          }
          console.log('Inserting capabilities:', capabilitiesInsert)

          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .insert(capabilitiesInsert)

          if (capabilitiesError) {
            console.error('❌ Capabilities insert error:', capabilitiesError)
          } else {
            console.log('✓ Capabilities inserted successfully')
          }
        }
      } else {
        console.log('⚠ WARNING: No capabilities data received from AI')
      }

      // ============================================================================
      // INSERT INDUSTRIES (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Industries ---')
      console.log('Industries array:', formData.industries)
      
      if (formData.industries && formData.industries.length > 0) {
        console.log(`Found ${formData.industries.length} industries to insert`)
        
        const { data: existingIndustries } = await supabase
          .from('industries')
          .select('industry_name')
          .eq('company_id', companyId)

        const existingNames = new Set(existingIndustries?.map(i => i.industry_name) || [])
        const newIndustries = formData.industries.filter(i => !existingNames.has(i.industry_name))

        if (newIndustries.length === 0) {
          console.log('⚠ Skipping: All industries already exist')
        } else {
          const industriesInsert: IndustryInsert[] = newIndustries.map((i) => ({
            company_id: companyId,
            industry_name: i.industry_name,
          }))
          console.log('Inserting industries:', industriesInsert)

          const { error: industriesError } = await supabase
            .from('industries')
            .insert(industriesInsert)

          if (industriesError) {
            console.error('❌ Industries insert error:', industriesError)
          } else {
            console.log(`✓ Inserted ${newIndustries.length} industries successfully`)
          }
        }
      } else {
        console.log('⚠ WARNING: No industries data received from AI')
      }

      // ============================================================================
      // INSERT CERTIFICATIONS (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Certifications ---')
      console.log('Certifications array:', formData.certifications)
      
      if (formData.certifications && formData.certifications.length > 0) {
        console.log(`Found ${formData.certifications.length} certifications to insert`)
        
        const { data: existingCertifications } = await supabase
          .from('certifications')
          .select('certification_type')
          .eq('company_id', companyId)

        const existingTypes = new Set(existingCertifications?.map(c => c.certification_type) || [])
        const newCertifications = formData.certifications.filter(c => !existingTypes.has(c.certification_type))

        if (newCertifications.length === 0) {
          console.log('⚠ Skipping: All certifications already exist')
        } else {
          const certificationsInsert: CertificationInsert[] = newCertifications.map((c) => ({
            company_id: companyId,
            certification_type: c.certification_type,
            certificate_number: c.certificate_number || null,
            status: c.status || 'Active',
            issued_date: c.issued_date || null,
            expiration_date: c.expiration_date || null,
          }))
          console.log('Inserting certifications:', certificationsInsert)

          const { error: certificationsError } = await supabase
            .from('certifications')
            .insert(certificationsInsert)

          if (certificationsError) {
            console.error('❌ Certifications insert error:', certificationsError)
          } else {
            console.log(`✓ Inserted ${newCertifications.length} certifications successfully`)
          }
        }
      } else {
        console.log('⚠ WARNING: No certifications data received from AI')
      }

      // ============================================================================
      // INSERT TECHNICAL SPECS (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Technical Specs ---')
      
      const hasTechSpecs = formData.technical_specs &&
        Object.values(formData.technical_specs).some(v => v !== null && v !== undefined && v !== false)
      
      console.log('Has technical specs data?', hasTechSpecs)
      console.log('Technical specs object:', formData.technical_specs)
      
      if (hasTechSpecs) {
        const { data: existing } = await supabase
          .from('technical_specs')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (existing) {
          console.log('⚠ Skipping: Technical specs already exist')
        } else {
          const technicalSpecsInsert: TechnicalSpecsInsert = {
            company_id: companyId,
            ...formData.technical_specs,
          }
          console.log('Inserting technical specs:', technicalSpecsInsert)

          const { error: technicalSpecsError } = await supabase
            .from('technical_specs')
            .insert(technicalSpecsInsert)

          if (technicalSpecsError) {
            console.error('❌ Technical specs insert error:', technicalSpecsError)
          } else {
            console.log('✓ Technical specs inserted successfully')
          }
        }
      } else {
        console.log('⚠ WARNING: No technical specs data received from AI')
      }

      // ============================================================================
      // INSERT BUSINESS INFO (with duplicate check)
      // ============================================================================
      console.log('\n--- Processing Business Info ---')
      
      const hasBusinessInfo = formData.business_info &&
        Object.values(formData.business_info).some(v => v !== null && v !== undefined && v !== false)
      
      console.log('Has business info data?', hasBusinessInfo)
      console.log('Business info object:', formData.business_info)
      
      if (hasBusinessInfo) {
        const { data: existing } = await supabase
          .from('business_info')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle()

        if (existing) {
          console.log('⚠ Skipping: Business info already exists')
        } else {
          const businessInfoInsert: BusinessInfoInsert = {
            company_id: companyId,
            ...formData.business_info,
          }
          console.log('Inserting business info:', businessInfoInsert)

          const { error: businessInfoError } = await supabase
            .from('business_info')
            .insert(businessInfoInsert)

          if (businessInfoError) {
            console.error('❌ Business info insert error:', businessInfoError)
          } else {
            console.log('✓ Business info inserted successfully')
          }
        }
      } else {
        console.log('⚠ WARNING: No business info data received from AI')
      }

      // Log change for new companies
      if (!existingCompany) {
        await logCompanyChanges(
          supabase,
          companyId,
          [{ field_name: 'company_name', old_value: null, new_value: formData.company_name }],
          user.email || 'unknown',
          user.user_metadata?.full_name || user.email || 'Admin',
          'created'
        )
      }

      console.log('\n=== AI RESEARCH IMPORT COMPLETED SUCCESSFULLY ===\n')
      toast.success(`Company ${existingCompany ? 'updated' : isDraft ? 'saved as draft' : 'created'} successfully!`)
      router.push('/admin/companies')
      router.refresh()
    } catch (error) {
      console.error('\n=== AI RESEARCH IMPORT FAILED ===')
      console.error('Error details:', error)
      
      // Provide more helpful error messages
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message: string }
        if (dbError.code === '23505') {
          toast.error('This company already exists in the database. Try a different name or website URL.')
        } else {
          toast.error(`Database error: ${dbError.message}`)
        }
      } else {
        toast.error('Failed to save company. Check browser console (F12) for details.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* AI Research Component */}
      <AiCompanyResearch onSaveCompany={handleSubmit} />
    </div>
  )
}