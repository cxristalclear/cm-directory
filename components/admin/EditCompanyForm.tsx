'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import CompanyForm from '@/components/admin/CompanyForm'
import type { CompanyFormData } from '@/types/admin'
import type { CompanyWithRelations } from '@/types/company'
import type { Database } from '@/lib/database.types'
import { getFieldChanges, logCompanyChanges, validateCompanyData, ensureUniqueSlug, generateSlug, normalizeWebsiteUrl } from '@/lib/admin/utils'
import { toast } from 'sonner'
import { prepareFacilityForDB } from '@/lib/admin/addressCompat'
import { geocodeFacilityFormData } from '@/lib/admin/geocoding'
import { formatCountryLabel, normalizeCountryCode, normalizeStateFilterValue } from '@/utils/locationFilters'


type CompanyUpdate = Database['public']['Tables']['companies']['Update']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type CapabilitiesUpdate = Database['public']['Tables']['capabilities']['Update']
type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
type IndustryInsert = Database['public']['Tables']['industries']['Insert']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type TechnicalSpecsUpdate = Database['public']['Tables']['technical_specs']['Update']
type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
type BusinessInfoUpdate = Database['public']['Tables']['business_info']['Update']
type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']

interface EditCompanyFormProps {
  company: CompanyWithRelations
}

export default function EditCompanyForm({ company }: EditCompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Prepare initial data from company
  const initialData: CompanyFormData = {
    company_name: company.company_name,
    dba_name: company.dba_name || undefined,
    description: company.description || undefined,
    website_url: company.website_url || undefined,
    year_founded: company.year_founded || undefined,
    employee_count_range: company.employee_count_range || undefined,
    annual_revenue_range: company.annual_revenue_range || undefined,
    key_differentiators: company.key_differentiators || undefined,
    facilities: company.facilities?.map(f => {
      const countryCode = normalizeCountryCode(f.country_code || f.country) || undefined
      const stateText = f.state_province || f.state || undefined
      const stateCode = normalizeStateFilterValue(f.state_code || stateText) || undefined
      const displayCountry = f.country?.trim() || (countryCode ? formatCountryLabel(countryCode) : undefined)
      return {
        id: f.id,
        facility_type: f.facility_type,
        street_address: f.street_address || undefined,
        city: f.city || undefined,
        state_province: stateText,
        state_code: stateCode,
        postal_code: f.postal_code || f.zip_code || undefined,
        country: displayCountry,
        country_code: countryCode,
        is_primary: f.is_primary || false,
        latitude: typeof f.latitude === 'number' ? f.latitude : null,
        longitude: typeof f.longitude === 'number' ? f.longitude : null,
        location: f.location ?? null,
      }
    }) || [],
    capabilities: company.capabilities?.[0] ? {
      pcb_assembly_smt: company.capabilities[0].pcb_assembly_smt || undefined,
      pcb_assembly_through_hole: company.capabilities[0].pcb_assembly_through_hole || undefined,
      pcb_assembly_mixed: company.capabilities[0].pcb_assembly_mixed || undefined,
      pcb_assembly_fine_pitch: company.capabilities[0].pcb_assembly_fine_pitch || undefined,
      cable_harness_assembly: company.capabilities[0].cable_harness_assembly || undefined,
      box_build_assembly: company.capabilities[0].box_build_assembly || undefined,
      testing_ict: company.capabilities[0].testing_ict || undefined,
      testing_functional: company.capabilities[0].testing_functional || undefined,
      testing_environmental: company.capabilities[0].testing_environmental || undefined,
      testing_rf_wireless: company.capabilities[0].testing_rf_wireless || undefined,
      design_services: company.capabilities[0].design_services || undefined,
      supply_chain_management: company.capabilities[0].supply_chain_management || undefined,
      prototyping: company.capabilities[0].prototyping || undefined,
      low_volume_production: company.capabilities[0].low_volume_production || undefined,
      medium_volume_production: company.capabilities[0].medium_volume_production || undefined,
      high_volume_production: company.capabilities[0].high_volume_production || undefined,
      turnkey_services: company.capabilities[0].turnkey_services || undefined,
      consigned_services: company.capabilities[0].consigned_services || undefined,
    } : {},
    industries: company.industries?.map(i => ({
      id: i.id,
      industry_name: i.industry_name,
    })) || [],
    certifications: company.certifications?.map(c => ({
      id: c.id,
      certification_type: c.certification_type,
      certificate_number: c.certificate_number || undefined,
      status: (c.status as 'Active' | 'Expired' | 'Pending') || undefined,
      issued_date: c.issued_date || undefined,
      expiration_date: c.expiration_date || undefined,
    })) || [],
    technical_specs: company.technical_specs?.[0] ? {
      smallest_component_size: company.technical_specs[0].smallest_component_size || undefined,
      finest_pitch_capability: company.technical_specs[0].finest_pitch_capability || undefined,
      max_pcb_size_inches: company.technical_specs[0].max_pcb_size_inches || undefined,
      max_pcb_layers: company.technical_specs[0].max_pcb_layers || undefined,
      lead_free_soldering: company.technical_specs[0].lead_free_soldering || undefined,
      conformal_coating: company.technical_specs[0].conformal_coating || undefined,
      potting_encapsulation: company.technical_specs[0].potting_encapsulation || undefined,
      x_ray_inspection: company.technical_specs[0].x_ray_inspection || undefined,
      aoi_inspection: company.technical_specs[0].aoi_inspection || undefined,
      flying_probe_testing: company.technical_specs[0].flying_probe_testing || undefined,
      burn_in_testing: company.technical_specs[0].burn_in_testing || undefined,
      clean_room_class: company.technical_specs[0].clean_room_class || undefined,
    } : {},
    business_info: company.business_info?.[0] ? {
      min_order_qty: company.business_info[0].min_order_qty || undefined,
      prototype_lead_time: company.business_info[0].prototype_lead_time || undefined,
      production_lead_time: company.business_info[0].production_lead_time || undefined,
      payment_terms: company.business_info[0].payment_terms || undefined,
      rush_order_capability: company.business_info[0].rush_order_capability || undefined,
      twenty_four_seven_production: company.business_info[0].twenty_four_seven_production || undefined,
      engineering_support_hours: company.business_info[0].engineering_support_hours || undefined,
      sales_territory: company.business_info[0].sales_territory || undefined,
      notable_customers: company.business_info[0].notable_customers || undefined,
      awards_recognition: company.business_info[0].awards_recognition || undefined,
    } : {},
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

      // Prepare company update data - match database types exactly
      const companyUpdate: CompanyUpdate = {
        company_name: formData.company_name,
        dba_name: formData.dba_name || null,
        slug: newSlug || null,
        description: formData.description || null,
        website_url: normalizeWebsiteUrl(formData.website_url),
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

      console.log('Updating company with data:', companyUpdate)

      // Update company
      const { error: companyError } = await supabase
        .from('companies')
        .update(companyUpdate)
        .eq('id', company.id)

      if (companyError) {
        console.error('Company update error details:', {
          message: companyError.message,
          details: companyError.details,
          hint: companyError.hint,
          code: companyError.code
        })
        throw companyError
      }

      console.log('Company updated successfully')

      // Update facilities (delete and recreate for simplicity)
      const { error: deleteFacilitiesError } = await supabase
        .from('facilities')
        .delete()
        .eq('company_id', company.id)

      if (deleteFacilitiesError) {
        console.error('Error deleting facilities:', deleteFacilitiesError)
        throw deleteFacilitiesError
      }

      if (formData.facilities && formData.facilities.length > 0) {
        const facilitiesWithCoords = await Promise.all(
          formData.facilities.map(async (facility) => {
            try {
              return await geocodeFacilityFormData(facility)
            } catch (error) {
              console.warn('Geocoding failed for facility, using existing coordinates:', error)
              return facility
            }
          })
        )

        const facilitiesData: FacilityInsert[] = facilitiesWithCoords.map(f => 
          prepareFacilityForDB({
            company_id: company.id,
            facility_type: f.facility_type,
            street_address: f.street_address || null,
            city: f.city || null,
            state_province: f.state_province || f.state || null,
            state_code: f.state_code || null,
            postal_code: f.postal_code || f.zip_code || null,
            country: f.country?.trim() || (f.country_code ? formatCountryLabel(f.country_code) : null),
            country_code: f.country_code || null,
            is_primary: f.is_primary || false,
            latitude: typeof f.latitude === 'number' ? f.latitude : null,
            longitude: typeof f.longitude === 'number' ? f.longitude : null,
            location: f.location ?? null,
          })
        )

        console.log('Inserting facilities:', facilitiesData)

        const { error: facilitiesError } = await supabase
          .from('facilities')
          .insert(facilitiesData)

        if (facilitiesError) {
          console.error('Facilities insert error:', facilitiesError)
          throw facilitiesError
        }
      }

      // Update capabilities (upsert)
      if (formData.capabilities && Object.keys(formData.capabilities).length > 0) {
        const existingCapabilities = company.capabilities?.[0]

        // Convert undefined to null for capabilities
        const capabilitiesData: CapabilitiesUpdate | CapabilitiesInsert = Object.fromEntries(
          Object.entries(formData.capabilities).map(([key, value]) => [key, value ?? null])
        )

        if (existingCapabilities) {
          // Update existing
          console.log('Updating capabilities:', capabilitiesData)
          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .update(capabilitiesData as CapabilitiesUpdate)
            .eq('company_id', company.id)

          if (capabilitiesError) {
            console.error('Capabilities update error:', capabilitiesError)
            throw capabilitiesError
          }
        } else {
          // Insert new
          console.log('Inserting capabilities:', capabilitiesData)
          const { error: capabilitiesError } = await supabase
            .from('capabilities')
            .insert({
              company_id: company.id,
              ...capabilitiesData,
            } as CapabilitiesInsert)

          if (capabilitiesError) {
            console.error('Capabilities insert error:', capabilitiesError)
            throw capabilitiesError
          }
        }
      }

      // Update industries (delete and recreate)
      await supabase.from('industries').delete().eq('company_id', company.id)
      if (formData.industries && formData.industries.length > 0) {
        const industriesData: IndustryInsert[] = formData.industries.map(i => ({
          company_id: company.id,
          industry_name: i.industry_name,
        }))

        const { error: industriesError } = await supabase
          .from('industries')
          .insert(industriesData)

        if (industriesError) {
          console.error('Industries insert error:', industriesError)
          throw industriesError
        }
      }

      // Update certifications (delete and recreate)
      await supabase.from('certifications').delete().eq('company_id', company.id)
      if (formData.certifications && formData.certifications.length > 0) {
        const certificationsData: CertificationInsert[] = formData.certifications.map(c => ({
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

        if (certificationsError) {
          console.error('Certifications insert error:', certificationsError)
          throw certificationsError
        }
      }

      // Update technical specs (upsert)
      if (formData.technical_specs && Object.keys(formData.technical_specs).length > 0) {
        const existingTechSpecs = company.technical_specs?.[0]

        // Convert undefined to null
        const techSpecsData: TechnicalSpecsUpdate | TechnicalSpecsInsert = Object.fromEntries(
          Object.entries(formData.technical_specs).map(([key, value]) => [key, value ?? null])
        )

        if (existingTechSpecs) {
          const { error: techSpecsError } = await supabase
            .from('technical_specs')
            .update(techSpecsData as TechnicalSpecsUpdate)
            .eq('company_id', company.id)

          if (techSpecsError) {
            console.error('Technical specs update error:', techSpecsError)
            throw techSpecsError
          }
        } else {
          const { error: techSpecsError } = await supabase
            .from('technical_specs')
            .insert({
              company_id: company.id,
              ...techSpecsData,
            } as TechnicalSpecsInsert)

          if (techSpecsError) {
            console.error('Technical specs insert error:', techSpecsError)
            throw techSpecsError
          }
        }
      }

      // Update business info (upsert)
      if (formData.business_info && Object.keys(formData.business_info).length > 0) {
        const existingBusinessInfo = company.business_info?.[0]

        // Convert undefined to null
        const businessInfoData: BusinessInfoUpdate | BusinessInfoInsert = Object.fromEntries(
          Object.entries(formData.business_info).map(([key, value]) => [key, value ?? null])
        )

        if (existingBusinessInfo) {
          const { error: businessInfoError } = await supabase
            .from('business_info')
            .update(businessInfoData as BusinessInfoUpdate)
            .eq('company_id', company.id)

          if (businessInfoError) {
            console.error('Business info update error:', businessInfoError)
            throw businessInfoError
          }
        } else {
          const { error: businessInfoError } = await supabase
            .from('business_info')
            .insert({
              company_id: company.id,
              ...businessInfoData,
            } as BusinessInfoInsert)

          if (businessInfoError) {
            console.error('Business info insert error:', businessInfoError)
            throw businessInfoError
          }
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
      // Log the full error object
      if (error && typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, null, 2))
      }
      toast.error('Failed to update company. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <CompanyForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
}
