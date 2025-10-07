'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CompanyForm from '@/components/admin/CompanyForm'
import type { CompanyFormData } from '@/types/admin'
import { getFieldChanges, logCompanyChanges, validateCompanyData, ensureUniqueSlug, generateSlug } from '@/lib/admin/utils'
import { toast } from 'sonner'

interface EditCompanyFormProps {
  company: any
}

export default function EditCompanyForm({ company }: EditCompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Prepare initial data from company
  const initialData: CompanyFormData = {
    company_name: company.company_name,
    dba_name: company.dba_name,
    description: company.description,
    website_url: company.website_url,
    year_founded: company.year_founded,
    employee_count_range: company.employee_count_range,
    annual_revenue_range: company.annual_revenue_range,
    key_differentiators: company.key_differentiators,
    facilities: company.facilities || [],
    capabilities: company.capabilities?.[0] || {},
    industries: company.industries || [],
    certifications: company.certifications || [],
    technical_specs: company.technical_specs?.[0] || {},
    business_info: company.business_info?.[0] || {},
  }

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

      // Check if slug needs to be regenerated
      let newSlug = company.slug
      if (formData.company_name !== company.company_name) {
        const baseSlug = generateSlug(formData.company_name)
        newSlug = await ensureUniqueSlug(supabase, baseSlug, company.id)
      }

      // Prepare company update data
      const companyUpdate = {
        company_name: formData.company_name,
        dba_name: formData.dba_name || null,
        slug: newSlug,
        description: formData.description || null,
        website_url: formData.website_url || null,
        year_founded: formData.year_founded || null,
        employee_count_range: formData.employee_count_range || null,
        annual_revenue_range: formData.annual_revenue_range || null,
        key_differentiators: formData.key_differentiators || null,
        is_active: !isDraft,
        updated_at: new Date().toISOString(),
        last_reviewed_by: user.email || 'admin',
        last_reviewed_at: new Date().toISOString(),
      }

      // Track changes for main company fields
      const mainFieldChanges = getFieldChanges(
        {
          company_name: company.company_name,
          dba_name: company.dba_name,
          description: company.description,
          website_url: company.website_url,
          year_founded: company.year_founded,
          employee_count_range: company.employee_count_range,
          annual_revenue_range: company.annual_revenue_range,
          key_differentiators: company.key_differentiators,
          is_active: company.is_active,
        },
        companyUpdate
      )

      // Update company
      const { error: companyError } = await supabase
        .from('companies')
        .update(companyUpdate)
        .eq('id', company.id)

      if (companyError) throw companyError

      // Update facilities (delete and recreate for simplicity)
      await supabase.from('facilities').delete().eq('company_id', company.id)
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

      // Update capabilities (upsert)
      if (formData.capabilities) {
        const existingCapabilities = company.capabilities?.[0]

        if (existingCapabilities) {
          // Update existing
          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .update(formData.capabilities)
            .eq('company_id', company.id)

          if (capabilitiesError) throw capabilitiesError
        } else {
          // Insert new
          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .insert({
              company_id: company.id,
              ...formData.capabilities,
            })

          if (capabilitiesError) throw capabilitiesError
        }
      }

      // Update industries (delete and recreate)
      await supabase.from('industries').delete().eq('company_id', company.id)
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

      // Update certifications (delete and recreate)
      await supabase.from('certifications').delete().eq('company_id', company.id)
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

      // Update technical specs (upsert)
      if (formData.technical_specs) {
        const existingTechSpecs = company.technical_specs?.[0]

        if (existingTechSpecs) {
          const { error: techSpecsError } = await supabase
            .from('technical_specs')
            .update(formData.technical_specs)
            .eq('company_id', company.id)

          if (techSpecsError) throw techSpecsError
        } else {
          const { error: techSpecsError } = await supabase
            .from('technical_specs')
            .insert({
              company_id: company.id,
              ...formData.technical_specs,
            })

          if (techSpecsError) throw techSpecsError
        }
      }

      // Update business info (upsert)
      if (formData.business_info) {
        const existingBusinessInfo = company.business_info?.[0]

        if (existingBusinessInfo) {
          const { error: businessInfoError } = await supabase
            .from('business_info')
            .update(formData.business_info)
            .eq('company_id', company.id)

          if (businessInfoError) throw businessInfoError
        } else {
          const { error: businessInfoError } = await supabase
            .from('business_info')
            .insert({
              company_id: company.id,
              ...formData.business_info,
            })

          if (businessInfoError) throw businessInfoError
        }
      }

      // Log changes
      if (mainFieldChanges.length > 0) {
        await logCompanyChanges(
          supabase,
          company.id,
          mainFieldChanges,
          user.email || 'admin',
          user.user_metadata?.name || user.email || 'Admin',
          'updated'
        )
      }

      toast.success('Company updated successfully!')
      router.push('/admin/companies')
      router.refresh()
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Failed to update company. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <CompanyForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
}