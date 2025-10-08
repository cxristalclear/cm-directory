'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CompanyForm from '@/components/admin/CompanyForm'
import type { CompanyFormData } from '@/types/admin'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData } from '@/lib/admin/utils'
import { toast } from 'sonner'

export default function AddCompanyPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

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
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: formData.company_name,
          dba_name: formData.dba_name || null,
          slug: uniqueSlug,
          description: formData.description || null,
          website_url: formData.website_url || null,
          year_founded: formData.year_founded || null,
          employee_count_range: formData.employee_count_range || null,
          annual_revenue_range: formData.annual_revenue_range || null,
          key_differentiators: formData.key_differentiators || null,
          is_active: !isDraft,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (companyError) throw companyError

      // Insert facilities
      if (formData.facilities && formData.facilities.length > 0) {
        const facilitiesData = formData.facilities.map(f => ({
          company_id: company.id,
          facility_type: f.facility_type,
          street_address: f.street_address || null,
          city: f.city || null,
          state: f.state || null,
          zip_code: f.zip_code || null,
          country: f.country || 'US',
          is_primary: f.is_primary || false,
        }))

        const { error: facilitiesError } = await supabase
          .from('facilities')
          .insert(facilitiesData)

        if (facilitiesError) throw facilitiesError
      }

      // Insert capabilities
      if (formData.capabilities) {
        const { error: capabilitiesError } = await supabase
          .from('capabilities')
          .insert({
            company_id: company.id,
            ...formData.capabilities,
          })

        if (capabilitiesError) throw capabilitiesError
      }

      // Insert industries
      if (formData.industries && formData.industries.length > 0) {
        const industriesData = formData.industries.map(i => ({
          company_id: company.id,
          industry_name: i.industry_name,
        }))

        const { error: industriesError } = await supabase
          .from('industries')
          .insert(industriesData)

        if (industriesError) throw industriesError
      }

      // Insert certifications
      if (formData.certifications && formData.certifications.length > 0) {
        const certificationsData = formData.certifications.map(c => ({
          company_id: company.id,
          certification_type: c.certification_type,
          certificate_number: c.certificate_number || null,
          status: c.status || 'Active',
          issued_date: c.issued_date || null,
          expiration_date: c.expiration_date || null,
        }))

        const { error: certificationsError } = await supabase
          .from('certifications')
          .insert(certificationsData)

        if (certificationsError) throw certificationsError
      }

      // Insert technical specs
      if (formData.technical_specs) {
        const { error: techSpecsError } = await supabase
          .from('technical_specs')
          .insert({
            company_id: company.id,
            ...formData.technical_specs,
          })

        if (techSpecsError) throw techSpecsError
      }

      // Insert business info
      if (formData.business_info) {
        const { error: businessInfoError } = await supabase
          .from('business_info')
          .insert({
            company_id: company.id,
            ...formData.business_info,
          })

        if (businessInfoError) throw businessInfoError
      }

      // Log creation in change log
      await logCompanyChanges(
        supabase,
        company.id,
        [{ field_name: 'company_created', old_value: null, new_value: formData.company_name }],
        user.email || 'admin',
        user.user_metadata?.name || user.email || 'Admin',
        'created'
      )

      toast.success(`Company ${isDraft ? 'saved as draft' : 'published'} successfully!`)
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
      <div className="glass-card gradient-border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">Add Company</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Create a new company profile in the directory
            </p>
          </div>
          {/* Action buttons should use the admin-btn-* styles when added */}
        </div>
      </div>

      <CompanyForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}