'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PostgrestError } from '@supabase/supabase-js'
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

const isProduction = process.env.NODE_ENV === 'production'

const logSupabaseError = (tableName: string, payload: unknown, error: PostgrestError | null) => {
  if (!error || isProduction) {
    return
  }

  console.error(`Failed to write to ${tableName}`, {
    table: tableName,
    payload,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    },
  })
}

export default function AiResearchPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean) => {
    setLoading(true)
    let uniqueSlug: string | undefined
    let companyId: string | undefined

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
      const ensuredSlug = await ensureUniqueSlug(supabase, baseSlug)
      uniqueSlug = ensuredSlug

      // Insert company
      const companyInsert: CompanyInsert = {
        company_name: formData.company_name,
        dba_name: formData.dba_name || null,
        slug: ensuredSlug,
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

      if (companyError) {
        logSupabaseError('companies', companyInsert, companyError)
        throw companyError
      }
      if (!company) throw new Error('Company creation failed')
      companyId = company.id

      // Insert facilities
      if (formData.facilities && formData.facilities.length > 0) {
        const facilities = formData.facilities
        const baseFacilities: FacilityInsert[] = facilities.map((f) => ({
          company_id: company.id,
          facility_type: f.facility_type,
          street_address: f.street_address || null,
          city: f.city || null,
          state: f.state || null,
          zip_code: f.zip_code || null,
          country: f.country || null,
          is_primary: f.is_primary || false,
          latitude: typeof f.latitude === 'number' ? f.latitude : null,
          longitude: typeof f.longitude === 'number' ? f.longitude : null,
          location: f.location ?? null,
        }))

        const geocodingResults = await Promise.allSettled(
          facilities.map((facility) => geocodeFacilityToPoint(facility))
        )

        const facilitiesInsert: FacilityInsert[] = baseFacilities.map((baseFacility, index) => {
          const geocodeResult = geocodingResults[index]

          if (geocodeResult?.status === 'fulfilled') {
            const { latitude, longitude, pointWkt } = geocodeResult.value

            return {
              ...baseFacility,
              latitude,
              longitude,
              location: pointWkt,
            }
          }

          if (geocodeResult?.status === 'rejected') {
            const error = geocodeResult.reason
            const facility = facilities[index]
            const facilityLabel =
              facility?.facility_type ||
              facility?.city ||
              facility?.street_address ||
              `Facility ${index + 1}`

            let errorMessage = 'Unknown error occurred while geocoding.'

            if (error instanceof GeocodeFacilityError) {
              errorMessage = error.message
            } else if (error instanceof Error) {
              errorMessage = error.message
            }

            const reasonSuffix = errorMessage ? ` (${errorMessage})` : ''

            toast.warning(`Unable to geocode ${facilityLabel}. Saved without coordinates${reasonSuffix}.`)
            console.warn('Failed to geocode facility before insertion', {
              facility: facilities[index],
              error,
            })
          }

          return baseFacility
        })

        const { error: facilitiesError } = await supabase.from('facilities').insert(facilitiesInsert)

        if (facilitiesError) {
          logSupabaseError('facilities', facilitiesInsert, facilitiesError)
          throw facilitiesError
        }
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

        if (capabilitiesError) {
          logSupabaseError('capabilities', capabilitiesInsert, capabilitiesError)
          throw capabilitiesError
        }
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

        if (industriesError) {
          logSupabaseError('industries', industriesInsert, industriesError)
          throw industriesError
        }
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

        if (certificationsError) {
          logSupabaseError('certifications', certificationsInsert, certificationsError)
          throw certificationsError
        }
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

        if (technicalSpecsError) {
          logSupabaseError('technical_specs', technicalSpecsInsert, technicalSpecsError)
          throw technicalSpecsError
        }
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

        if (businessInfoError) {
          logSupabaseError('business_info', businessInfoInsert, businessInfoError)
          throw businessInfoError
        }
      }

      // Log change
      const changeLogChanges = [
        {
          field_name: 'company_name',
          old_value: null,
          new_value: company.company_name,
        },
      ]

      const changeLogPayload = changeLogChanges.map((change) => ({
        company_id: company.id,
        changed_by_email: user.email || 'unknown',
        changed_by_name: user.user_metadata?.full_name || user.email || 'Admin',
        change_type: 'created' as const,
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
        changed_at: new Date().toISOString(),
      }))

      try {
        await logCompanyChanges(
          supabase,
          company.id,
          changeLogChanges,
          user.email || 'unknown',
          user.user_metadata?.full_name || user.email || 'Admin',
          'created'
        )
      } catch (logError) {
        if (!isProduction) {
          const postgrestError = logError as PostgrestError | undefined
          console.error('Failed to write to company_change_log', {
            table: 'company_change_log',
            payload: changeLogPayload,
            error: {
              message: postgrestError?.message,
              details: postgrestError?.details,
              hint: postgrestError?.hint,
              code: postgrestError?.code,
            },
          })
        }
        throw logError
      }

      toast.success(`Company ${isDraft ? 'saved as draft' : 'created'} successfully!`)
      router.push('/admin/companies')
      router.refresh()
    } catch (error) {
      const structuredError = {
        error,
        message: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        slug: uniqueSlug,
        companyId,
      }

      if (isProduction) {
        console.error('Error creating company', {
          message: structuredError.message,
          slug: structuredError.slug,
          companyId: structuredError.companyId,
        })
      } else {
        console.error('Error creating company', structuredError)
      }

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