'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AiCompanyResearch from '@/components/admin/AiCompanyResearch'
import type { CompanyFormData } from '@/types/admin'
import type { Database } from '@/lib/database.types'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData } from '@/lib/admin/utils'
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

      // Generate unique slug
      const baseSlug = generateSlug(formData.company_name)
      const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug)

      // Insert company
      const companyInsert: CompanyInsert = {
        company_name: formData.company_name,
        dba_name: formData.dba_name || null,
        slug: uniqueSlug,
        description: formData.description || null,
        website_url: formData.website_url || '', // Empty string instead of null
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

      if (companyError) throw companyError
      if (!company) throw new Error('Company creation failed')

      // Insert facilities
      if (formData.facilities && formData.facilities.length > 0) {
        const facilitiesInsert: FacilityInsert[] = formData.facilities.map((f) => ({
          company_id: company.id,
          facility_type: f.facility_type,
          street_address: f.street_address || null,
          city: f.city || null,
          state: f.state || null,
          zip_code: f.zip_code || null,
          country: f.country || 'US',
          is_primary: f.is_primary || false,
          latitude: typeof f.latitude === 'number' ? f.latitude : null,
          longitude: typeof f.longitude === 'number' ? f.longitude : null,
          location: f.location ?? null,
        }))

        const { error: facilitiesError } = await supabase
          .from('facilities')
          .insert(facilitiesInsert)

        if (facilitiesError) throw facilitiesError
      }

      // Insert capabilities
      if (formData.capabilities) {
        const capabilitiesInsert: CapabilitiesInsert = {
          company_id: company.id,
          ...formData.capabilities,
        }

        const { error: capabilitiesError } = await supabase
          .from('capabilities')
          .insert(capabilitiesInsert)

        if (capabilitiesError) throw capabilitiesError
      }

      // Insert industries
      if (formData.industries && formData.industries.length > 0) {
        const industriesInsert: IndustryInsert[] = formData.industries.map((i) => ({
          company_id: company.id,
          industry_name: i.industry_name,
        }))

        const { error: industriesError } = await supabase
          .from('industries')
          .insert(industriesInsert)

        if (industriesError) throw industriesError
      }

      // Insert certifications
      if (formData.certifications && formData.certifications.length > 0) {
        const certificationsInsert: CertificationInsert[] = formData.certifications.map((c) => ({
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
      if (formData.technical_specs) {
        const technicalSpecsInsert: TechnicalSpecsInsert = {
          company_id: company.id,
          ...formData.technical_specs,
        }

        const { error: technicalSpecsError } = await supabase
          .from('technical_specs')
          .insert(technicalSpecsInsert)

        if (technicalSpecsError) throw technicalSpecsError
      }

      // Insert business info
      if (formData.business_info) {
        const businessInfoInsert: BusinessInfoInsert = {
          company_id: company.id,
          ...formData.business_info,
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
      router.push('/admin/companies')
      router.refresh()
    } catch (error) {
      console.error('Error creating company:', error)
      toast.error('Failed to create company. Please try again.')
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