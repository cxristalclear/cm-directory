'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CompanyForm from '@/components/admin/CompanyForm'
import type { CompanyFormData } from '@/types/admin'
import type { Database } from '@/lib/database.types'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData, normalizeWebsiteUrl } from '@/lib/admin/utils'
import { toast } from 'sonner'
import { prepareFacilityForDB } from '@/lib/admin/addressCompat'
import { geocodeFacilityFormData } from '@/lib/admin/geocoding'

type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
type IndustryInsert = Database['public']['Tables']['industries']['Insert']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']

export default function AddCompanyPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean) => {
    setLoading(true)

    let createdCompanyId: string | null = null

    try {
      // Normalize website URL before validation - ensure it has http:// or https://
      const normalizedFormData = {
        ...formData,
        website_url: normalizeWebsiteUrl(formData.website_url),
      }

      // Validate data
      const validation = validateCompanyData(normalizedFormData)
      if (!validation.valid) {
        toast.error(validation.errors.join(', '))
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate unique slug
      const baseSlug = generateSlug(formData.company_name)
      const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug)

      // Insert company with normalized website URL
      const companyInsert: CompanyInsert = {
        company_name: normalizedFormData.company_name,
        dba_name: normalizedFormData.dba_name || null,
        slug: uniqueSlug,
        description: normalizedFormData.description || null,
        website_url: normalizedFormData.website_url,
        year_founded: normalizedFormData.year_founded || null,
        employee_count_range: normalizedFormData.employee_count_range || null,
        annual_revenue_range: normalizedFormData.annual_revenue_range || null,
        key_differentiators: normalizedFormData.key_differentiators || null,
        is_active: !isDraft,
        is_verified: normalizedFormData.is_verified || false,
        verified_until: normalizedFormData.verified_until || null,
      }

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert(companyInsert)
        .select()
        .single()

      if (companyError) throw companyError
      if (!company) throw new Error('Company creation failed')

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdCompanyId = company.id

      // Insert facilities
      if (normalizedFormData.facilities && normalizedFormData.facilities.length > 0) {
        const facilitiesWithCoords = await Promise.all(
          normalizedFormData.facilities.map(async (facility) => geocodeFacilityFormData(facility))
        )

        const facilitiesInsert: FacilityInsert[] = facilitiesWithCoords.map((f) =>
          prepareFacilityForDB({
            company_id: company.id,
            facility_type: f.facility_type,
            street_address: f.street_address || null,
            city: f.city || null,
            state_province: f.state_province || f.state || null,
            state_code: f.state_code || null,
            postal_code: f.postal_code || f.zip_code || null,
            country: f.country || null,
            country_code: f.country_code || null,
            is_primary: f.is_primary || false,
            latitude: typeof f.latitude === 'number' ? f.latitude : null,
            longitude: typeof f.longitude === 'number' ? f.longitude : null,
            location: f.location ?? null,
          })
        )

        const { error: facilitiesError } = await supabase
          .from('facilities')
          .insert(facilitiesInsert)

        if (facilitiesError) throw facilitiesError
      }

      // Insert capabilities
      if (normalizedFormData.capabilities) {
        const capabilitiesInsert: CapabilitiesInsert = {
          company_id: company.id,
          ...normalizedFormData.capabilities,
        }

        const { error: capabilitiesError } = await supabase
          .from('capabilities')
          .insert(capabilitiesInsert)

        if (capabilitiesError) throw capabilitiesError
      }

      // Insert industries
      if (normalizedFormData.industries && normalizedFormData.industries.length > 0) {
        const industriesInsert: IndustryInsert[] = normalizedFormData.industries.map((i) => ({
          company_id: company.id,
          industry_name: i.industry_name,
        }))

        const { error: industriesError } = await supabase
          .from('industries')
          .insert(industriesInsert)

        if (industriesError) throw industriesError
      }

      // Insert certifications
      if (normalizedFormData.certifications && normalizedFormData.certifications.length > 0) {
        const certificationsInsert: CertificationInsert[] = normalizedFormData.certifications.map((c) => ({
          company_id: company.id,
          certification_type: c.certification_type,
          certificate_number: c.certificate_number || null,
          status: c.status || 'Active',
          issued_date: c.issued_date || null,
          expiration_date: c.expiration_date || null,
        }))

        const { error: certificationsError } = await supabase
          .from('certifications')
          .insert(certificationsInsert)

        if (certificationsError) throw certificationsError
      }

      // Insert technical specs
      if (normalizedFormData.technical_specs) {
        const technicalSpecsInsert: TechnicalSpecsInsert = {
          company_id: company.id,
          ...normalizedFormData.technical_specs,
        }

        const { error: technicalSpecsError } = await supabase
          .from('technical_specs')
          .insert(technicalSpecsInsert)

        if (technicalSpecsError) throw technicalSpecsError
      }

      // Insert business info
      if (normalizedFormData.business_info) {
        const businessInfoInsert: BusinessInfoInsert = {
          company_id: company.id,
          ...normalizedFormData.business_info,
        }

        const { error: businessInfoError } = await supabase
          .from('business_info')
          .insert(businessInfoInsert)

        if (businessInfoError) throw businessInfoError
      }

      // Log change
      await logCompanyChanges(
        supabase,
        company.id,
        [
          {
            field_name: 'company_name',
            old_value: null,
            new_value: company.company_name,
          },
        ],
        user.email || 'unknown',
        user.user_metadata?.full_name || user.email || 'Admin',
        'created'
      )

      toast.success(`Company ${isDraft ? 'saved as draft' : 'created'} successfully!`)
      
      // Only redirect on successful creation
      router.push('/admin/companies')
      router.refresh()
    } catch (error) {
      console.error('Error creating company:', error)
      
      // User-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create company'
      toast.error(`Import failed: ${errorMessage}. Your research data is still above - please fix and try again.`)
      
      // Do NOT redirect - stay on the page so user can see and fix the data
      // Data remains in the form and can be corrected
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">Add Company</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Create a new company profile in the directory
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/companies/research')}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>🤖</span>
            AI Research Instead
          </button>
        </div>
      </div>

      <CompanyForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
