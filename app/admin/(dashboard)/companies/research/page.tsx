'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AiCompanyResearch from '@/components/admin/AiCompanyResearch'
import type { CompanyFormData } from '@/types/admin'
import type { Database, Json } from '@/lib/database.types'
import { generateSlug, ensureUniqueSlug, logCompanyChanges, validateCompanyData, normalizeWebsiteUrl, getFieldChanges } from '@/lib/admin/utils'
import { geocodeFacilityToPoint } from '@/lib/admin/geocoding'
import { toast } from 'sonner'
import { prepareFacilityForDB, hasMinimumAddressData } from '@/lib/admin/addressCompat'

type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type CompanyBaseInsert = Omit<CompanyInsert, 'slug'>
type CompanyRow = Database['public']['Tables']['companies']['Row']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type CapabilitiesInsert = Database['public']['Tables']['capabilities']['Insert']
type IndustryInsert = Database['public']['Tables']['industries']['Insert']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type TechnicalSpecsInsert = Database['public']['Tables']['technical_specs']['Insert']
type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert']
type ResearchHistoryInsert = Database['public']['Tables']['company_research_history']['Insert']
type SupabaseClientType = ReturnType<typeof createClient>

type CompanyRelatedTable =
  | 'facilities'
  | 'capabilities'
  | 'industries'
  | 'certifications'
  | 'technical_specs'
  | 'business_info'

type TableInsert<TableName extends CompanyRelatedTable> =
  Database['public']['Tables'][TableName]['Insert']
type TableRow<TableName extends CompanyRelatedTable> =
  Database['public']['Tables'][TableName]['Row']

type ComparableValue = string | number | boolean | null

type Serializer<TRecord> = (record: TRecord) => string

function normalizeComparableValue(value: unknown): ComparableValue {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return null
}

function createSerializer<TRecord extends object>(fields: (keyof TRecord)[]): Serializer<TRecord> {
  return (record: TRecord) => {
    const comparableEntries = fields
      .map<[string, ComparableValue]>(field => [
        String(field),
        normalizeComparableValue((record as Record<string, unknown>)[field as string]),
      ])
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    return JSON.stringify(Object.fromEntries(comparableEntries))
  }
}

function dedupeRecords<TRecord>(records: TRecord[], serialize: Serializer<TRecord>): TRecord[] {
  const seen = new Set<string>()
  return records.filter(record => {
    const key = serialize(record)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

async function syncRelatedTable<TableName extends CompanyRelatedTable>({
  supabase,
  table,
  companyId,
  description,
  records,
  serializeRow,
}: {
  supabase: SupabaseClientType
  table: TableName
  companyId: string
  description: string
  records: TableInsert<TableName>[]
  serializeRow: Serializer<TableInsert<TableName>>
}): Promise<void> {
  const normalizedRecords = records.length > 0 ? dedupeRecords(records, serializeRow) : []

  const { data: existingRows, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('company_id' as never, companyId)

  if (fetchError) {
    throw new Error(`${description} fetch failed: ${fetchError.message}`)
  }

  const existing = ((existingRows ?? []) as unknown) as TableRow<TableName>[]
  const buckets = new Map<string, TableRow<TableName>[]>()

  for (const row of existing) {
    const key = serializeRow(row as unknown as TableInsert<TableName>)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.push(row)
    } else {
      buckets.set(key, [row])
    }
  }

  const pendingInsert: TableInsert<TableName>[] = []
  for (const record of normalizedRecords) {
    const key = serializeRow(record)
    const bucket = buckets.get(key)
    if (bucket && bucket.length > 0) {
      bucket.shift()
    } else {
      pendingInsert.push(record)
    }
  }

  const idsToDelete: string[] = []
  for (const bucket of buckets.values()) {
    for (const row of bucket) {
      const idValue = (row as { id?: unknown }).id
      if (typeof idValue === 'string') {
        idsToDelete.push(idValue)
      }
    }
  }

  if (pendingInsert.length === 0 && idsToDelete.length === 0) {
    return
  }

  if (pendingInsert.length > 0) {
    const { error: insertError } = await supabase
      .from(table)
      .insert(pendingInsert as never)
    if (insertError) {
      throw new Error(`${description} insert failed: ${insertError.message}`)
    }
  }

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase.from(table).delete().in('id', idsToDelete as never[])
    if (deleteError) {
      throw new Error(`${description} delete failed: ${deleteError.message}`)
    }
  }
}

const facilitiesSerializer = createSerializer<FacilityInsert>([
  'company_id',
  'facility_type',
  'street_address',
  'city',
  'state_province',
  'state_code',
  'postal_code',
  'country',
  'country_code',
  'is_primary',
  'latitude',
  'longitude',
] as (keyof FacilityInsert)[])

const capabilitiesSerializer = createSerializer<CapabilitiesInsert>([
  'company_id',
  'pcb_assembly_smt',
  'pcb_assembly_through_hole',
  'pcb_assembly_mixed',
  'pcb_assembly_fine_pitch',
  'cable_harness_assembly',
  'box_build_assembly',
  'testing_ict',
  'testing_functional',
  'testing_environmental',
  'testing_rf_wireless',
  'design_services',
  'supply_chain_management',
  'prototyping',
  'low_volume_production',
  'medium_volume_production',
  'high_volume_production',
  'turnkey_services',
  'consigned_services',
  'lead_free_soldering',
] as (keyof CapabilitiesInsert)[])

const industriesSerializer = createSerializer<IndustryInsert>([
  'company_id',
  'industry_name',
  'is_specialization',
  'years_experience',
  'notable_projects',
] as (keyof IndustryInsert)[])

const certificationsSerializer = createSerializer<CertificationInsert>([
  'company_id',
  'certification_type',
  'certificate_number',
  'status',
  'issued_date',
  'expiration_date',
  'issuing_body',
  'scope',
] as (keyof CertificationInsert)[])

const technicalSpecsSerializer = createSerializer<TechnicalSpecsInsert>([
  'company_id',
  'smallest_component_size',
  'finest_pitch_capability',
  'max_pcb_size_inches',
  'max_pcb_layers',
  'lead_free_soldering',
  'conformal_coating',
  'potting_encapsulation',
  'x_ray_inspection',
  'aoi_inspection',
  'flying_probe_testing',
  'burn_in_testing',
  'clean_room_class',
  'additional_specs',
] as (keyof TechnicalSpecsInsert)[])

const businessInfoSerializer = createSerializer<BusinessInfoInsert>([
  'company_id',
  'min_order_qty',
  'prototype_lead_time',
  'production_lead_time',
  'payment_terms',
  'rush_order_capability',
  'twenty_four_seven_production',
  'engineering_support_hours',
  'sales_territory',
  'notable_customers',
  'awards_recognition',
] as (keyof BusinessInfoInsert)[])

function escapeForILikePattern(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1')
}

function normalizeUrlForComparison(
  url: string | null | undefined,
  alreadyNormalized = false
): string | null {
  if (!url) return null
  const normalized = alreadyNormalized ? url : normalizeWebsiteUrl(url)
  if (!normalized) return null
  try {
    const parsed = new URL(normalized)
    const trimmedPath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '')
    return `${parsed.protocol}//${parsed.host}${trimmedPath}`.toLowerCase()
  } catch {
    return normalized.trim().toLowerCase()
  }
}

function extractHostname(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

async function findExistingCompany({
  supabase,
  normalizedWebsiteComparable,
  websiteFilterValue,
  normalizedNameComparable,
}: {
  supabase: SupabaseClientType
  normalizedWebsiteComparable: string | null
  websiteFilterValue: string | null
  normalizedNameComparable: string
}): Promise<CompanyRow | null> {
  if (normalizedWebsiteComparable && websiteFilterValue) {
    const websitePattern = `%${escapeForILikePattern(websiteFilterValue)}%`
    const { data: websiteCandidates, error: websiteError } = await supabase
      .from('companies')
      .select('*')
      .ilike('website_url', websitePattern)
      .limit(10)

    if (websiteError) {
      throw websiteError
    }

    const canonicalMatches = (websiteCandidates ?? []).filter((candidate) => {
      const candidateComparable = normalizeUrlForComparison(candidate.website_url)
      return candidateComparable === normalizedWebsiteComparable
    })

    if (canonicalMatches.length === 1) {
      return canonicalMatches[0]
    }

    if (canonicalMatches.length > 1) {
      const matchedByName = canonicalMatches.find((candidate) => {
        const candidateName = candidate.company_name?.trim().toLowerCase()
        return candidateName === normalizedNameComparable
      })
      if (matchedByName) {
        return matchedByName
      }
    }
  }

  const { data: nameCandidates, error: nameError } = await supabase
    .from('companies')
    .select('*')
    .ilike('company_name', escapeForILikePattern(normalizedNameComparable))
    .limit(1)

  if (nameError) {
    throw nameError
  }

  return (
    (nameCandidates ?? []).find((candidate) => {
      const candidateName = candidate.company_name?.trim().toLowerCase()
      return candidateName === normalizedNameComparable
    }) ?? null
  )
}

export default function AiResearchPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: CompanyFormData, isDraft: boolean, enrichmentPayload?: unknown) => {
    try {
      // ⭐ NORMALIZE WEBSITE URL FIRST - before validation!
      const normalizedFormData = {
        ...formData,
        website_url: normalizeWebsiteUrl(formData.website_url),
      }

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
      // CHECK FOR DUPLICATE COMPANY (by name OR normalized website)
      // ============================================================================
      const normalizedNameComparable = normalizedFormData.company_name.trim().toLowerCase()
      const normalizedWebsiteComparable = normalizeUrlForComparison(normalizedFormData.website_url, true)
      const websiteFilterValue = normalizedFormData.website_url
        ? extractHostname(normalizedFormData.website_url) ?? normalizedWebsiteComparable
        : null

      const existingCompany = normalizedNameComparable
        ? await findExistingCompany({
            supabase,
            normalizedWebsiteComparable,
            websiteFilterValue,
            normalizedNameComparable,
          })
        : null

      const sharedCompanyFields: CompanyBaseInsert = {
        company_name: normalizedFormData.company_name,
        dba_name: normalizedFormData.dba_name || null,
        description: normalizedFormData.description || null,
        website_url: normalizedFormData.website_url,
        year_founded: normalizedFormData.year_founded || null,
        employee_count_range: normalizedFormData.employee_count_range || null,
        annual_revenue_range: normalizedFormData.annual_revenue_range || null,
        key_differentiators: normalizedFormData.key_differentiators || null,
        is_verified: normalizedFormData.is_verified ?? false,
        verified_until: normalizedFormData.verified_until || null,
        is_active: !isDraft,
      }

      let companyId: string
      let persistedCompany: CompanyRow
      let changeType: 'created' | 'updated' = 'created'

      if (existingCompany) {
        toast.info(`Company already exists: ${existingCompany.company_name}. Updating data...`)

        const { data: updatedCompany, error: updateError } = await supabase
          .from('companies')
          .update(sharedCompanyFields as CompanyUpdate)
          .eq('id', existingCompany.id)
          .select('*')
          .single()

        if (updateError) throw updateError
        persistedCompany = updatedCompany
        companyId = updatedCompany.id
        changeType = 'updated'
      } else {
        let newSlug = generateSlug(normalizedFormData.company_name)
        newSlug = await ensureUniqueSlug(supabase, newSlug)

        const companyInsert: CompanyInsert = {
          ...sharedCompanyFields,
          slug: newSlug,
        }

        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .insert(companyInsert)
          .select('*')
          .single()

        if (companiesError) throw companiesError
        persistedCompany = companiesData
        companyId = companiesData.id
      }

      // Insert or replace facilities
      if (Array.isArray(normalizedFormData.facilities)) {
        const facilitiesData: FacilityInsert[] = []

        for (const facility of normalizedFormData.facilities) {
          let latitude = facility.latitude
          let longitude = facility.longitude

          if ((latitude == null || longitude == null) && hasMinimumAddressData(facility) && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
            try {
              const coordinates = await geocodeFacilityToPoint(facility)
              latitude = coordinates.latitude
              longitude = coordinates.longitude
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
            state_province: facility.state_province || facility.state || null,
            state_code: facility.state_code || null,
            postal_code: facility.postal_code || facility.zip_code || null,
            country: facility.country && facility.country.trim() ? facility.country : null,
            country_code: facility.country_code || null,
            is_primary: facility.is_primary || false,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
          }))
        }

        await syncRelatedTable({
          supabase,
          table: 'facilities',
          companyId,
          description: 'facilities',
          records: facilitiesData,
          serializeRow: facilitiesSerializer,
        })
      }

      // Insert capabilities
      if (normalizedFormData.capabilities) {
        const hasCapabilities = Object.values(normalizedFormData.capabilities).some(
          (value) => value !== null && value !== undefined && value !== false
        )
        const capabilitiesInsert: CapabilitiesInsert = {
          company_id: companyId,
          ...normalizedFormData.capabilities,
        }

        await syncRelatedTable({
          supabase,
          table: 'capabilities',
          companyId,
          description: 'capabilities',
          records: hasCapabilities ? [capabilitiesInsert] : [],
          serializeRow: capabilitiesSerializer,
        })
      }

      // Insert industries
      if (Array.isArray(normalizedFormData.industries)) {
        const industriesInsert: IndustryInsert[] = normalizedFormData.industries.map((i) => ({
          company_id: companyId,
          industry_name: i.industry_name,
        }))

        await syncRelatedTable({
          supabase,
          table: 'industries',
          companyId,
          description: 'industries',
          records: industriesInsert,
          serializeRow: industriesSerializer,
        })
      }

      // Insert certifications
      if (Array.isArray(normalizedFormData.certifications)) {
        const certificationsInsert: CertificationInsert[] = normalizedFormData.certifications.map((c) => ({
          company_id: companyId,
          certification_type: c.certification_type,
          certificate_number: c.certificate_number || null,
          status: c.status || 'Active',
          issued_date: c.issued_date || null,
          expiration_date: c.expiration_date || null,
        }))

        await syncRelatedTable({
          supabase,
          table: 'certifications',
          companyId,
          description: 'certifications',
          records: certificationsInsert,
          serializeRow: certificationsSerializer,
        })
      }

      // Insert technical specs
      const techSpecsCount = normalizedFormData.technical_specs
        ? Object.values(normalizedFormData.technical_specs).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (normalizedFormData.technical_specs) {
        const technicalSpecsInsert: TechnicalSpecsInsert = {
          company_id: companyId,
          ...normalizedFormData.technical_specs,
        }

        await syncRelatedTable({
          supabase,
          table: 'technical_specs',
          companyId,
          description: 'technical specs',
          records: techSpecsCount > 0 ? [technicalSpecsInsert] : [],
          serializeRow: technicalSpecsSerializer,
        })
      }

      // Insert business info
      const businessInfoCount = normalizedFormData.business_info
        ? Object.values(normalizedFormData.business_info).filter(v => v !== null && v !== undefined && v !== false).length
        : 0

      if (normalizedFormData.business_info) {
        const businessInfoInsert: BusinessInfoInsert = {
          company_id: companyId,
          ...normalizedFormData.business_info,
        }

        await syncRelatedTable({
          supabase,
          table: 'business_info',
          companyId,
          description: 'business info',
          records: businessInfoCount > 0 ? [businessInfoInsert] : [],
          serializeRow: businessInfoSerializer,
        })
      }

      // Log research snapshot
      const sanitizedSnapshot = JSON.parse(JSON.stringify(normalizedFormData)) as Json
      const enrichmentSnapshot = enrichmentPayload
        ? (JSON.parse(JSON.stringify(enrichmentPayload)) as Json)
        : null

      const historySource = changeType === 'created' ? 'ai_research' : 'ai_research_update'
      const historyInsert: ResearchHistoryInsert = {
        company_id: companyId,
        company_name: persistedCompany.company_name,
        website_url: persistedCompany.website_url || null,
        research_snapshot: sanitizedSnapshot,
        research_summary: normalizedFormData.description || normalizedFormData.key_differentiators || null,
        research_notes: normalizedFormData.key_differentiators || null,
        data_confidence: null,
        source: historySource,
        created_by_email: user.email || 'unknown',
        created_by_name: user.user_metadata?.full_name || user.email || 'Admin',
        enrichment_snapshot: enrichmentSnapshot,
      }

      const { error: historyError } = await supabase
        .from('company_research_history')
        .insert(historyInsert)

      if (historyError) {
        console.error('Research history insert error:', historyError)
      }

      const auditChanges = getFieldChanges(
        (existingCompany ?? {}) as Partial<CompanyRow>,
        persistedCompany
      )

      if (auditChanges.length > 0) {
        await logCompanyChanges(
          supabase,
          companyId,
          auditChanges,
          user.email || 'unknown',
          user.user_metadata?.full_name || user.email || 'Admin',
          changeType
        )
      }

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
