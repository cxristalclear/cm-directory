import 'server-only'

/**
 * Main Company Research Logic
 * Orchestrates ZoomInfo enrichment and OpenAI research
 */

import { callOpenAI } from './openaiClient'
import { enrichCompanyData, formatEnrichmentData } from './zoomInfoEnrich'
import type { CompanyFormData } from '@/types/admin'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { normalizeWebsiteUrl } from '@/lib/admin/utils'
import {
  normalizeCountryCode,
  normalizeStateFilterValue,
  formatStateLabelFromKey,
  inferCountryCodeFromState,
  inferCountryCodeFromStateKey,
  formatCountryLabel,
} from '@/utils/locationFilters'
import { getCountryName } from '@/utils/countryMapping'

// System prompt from custom_cm_search_instructions.txt
const SYSTEM_PROMPT = `You are a structured data collection agent for electronics manufacturing companies. Your job is to return a **fully completed JSON array** of 1 company per request, based on the given schema.

1. You must fill out all fields – **if data is missing**, use:
   - "" for empty strings  
   - [] for empty arrays  
   - null for nulls  
   - true/false for booleans

2. You must **never ask questions or request permission to proceed**. Just fill in what you can and return the full JSON.

3. You must always return **valid JSON** and only JSON. Never include explanations, markdown, or text.

4. You should never stop early. Fill the entire JSON object completely. Use placeholder values only when you've confirmed the data is not available.

5. Follow the rules for lead_time, certifications, industries, and capabilities strictly.

If ZoomInfo enrichCompany() returns nothing, leave note in research_notes and continue with public sources.

Always fill the following fields:
- company_name, slug, website, description, facilities, capabilities, certifications, technical_specs, industries, business_info, research_notes, research_date, data_confidence

Return a **single valid JSON array** with one object matching this exact structure:
{
  "company_name": "string",
  "dba_name": "string",
  "slug": "string",
  "website": "string",
  "logo_url": "string",
  "description": "string",
  "public_description": "string",
  "year_founded": 2015,
  "employee_count_range": "250-500",
  "annual_revenue_range": "$50M-150M",
  "is_active": true,
  "is_verified": true,
  "facilities": [
    {
      "facility_type": "HQ | Manufacturing",
      "street_address": "string",
      "city": "string",
      "state_province": "string",
      "state_code": "string",
      "postal_code": "string",
      "country": "USA",
      "facility_size_sqft": null,
      "employees_at_location": 100,
      "key_capabilities": "string",
      "is_primary": true
    }
  ],
  "capabilities": {
    "pcb_assembly_smt": true,
    "pcb_assembly_through_hole": true,
    "pcb_assembly_mixed": true,
    "pcb_assembly_fine_pitch": false,
    "cable_harness_assembly": true,
    "box_build_assembly": true,
    "testing_ict": true,
    "testing_functional": true,
    "testing_environmental": false,
    "testing_rf_wireless": false,
    "design_services": true,
    "supply_chain_management": true,
    "prototyping": true,
    "low_volume_production": true,
    "medium_volume_production": true,
    "high_volume_production": false,
    "turnkey_services": true,
    "consigned_services": true,
    "lead_free_soldering": true
  },
  "industries": [
    {
      "industry_name": "string",
      "is_specialization": true,
      "years_experience": 5,
      "notable_projects": "string"
    }
  ],
  "certifications": [
    {
      "certification_type": "ISO9001",
      "status": "Active",
      "certificate_number": "string",
      "issue_date": "2023-05-31",
      "expiration_date": "2026-05-30",
      "issuing_body": "string",
      "scope": "string"
    }
  ],
  "technical_specs": {
    "smallest_component_size": "01005",
    "finest_pitch_capability": "0.3mm",
    "max_pcb_size_inches": "20x24",
    "max_pcb_layers": 40,
    "lead_free_soldering": true,
    "conformal_coating": true,
    "potting_encapsulation": true,
    "x_ray_inspection": true,
    "aoi_inspection": true,
    "flying_probe_testing": true,
    "burn_in_testing": true,
    "clean_room_class": "ISO Class 7",
    "additional_specs": "string"
  },
  "business_info": {
    "min_order_qty": "No minimum",
    "prototype_lead_time": "2-3 weeks",
    "production_lead_time": "4-6 weeks",
    "payment_terms": "Net 30",
    "rush_orders": true,
    "twentyfour_seven": false,
    "engineering_support_hours": "8AM-6PM EST",
    "sales_territory": "Global"
  },
  "key_differentiators": "string",
  "notable_customers": "string",
  "awards": "string",
  "research_date": "2025-10-15",
  "data_confidence": "High",
  "research_notes": "string"
}

CRITICAL: NEVER guess addresses. Use exact addresses from ZoomInfo enrichment. If ZoomInfo provides no address, use the address on the company website. If no address is found, leave address fields empty.

You must only return JSON with proper formatting and escaping and nothing else.`

const DOCUMENT_SYSTEM_PROMPT = `You are a document ingestion agent for electronics manufacturing companies. You receive official customer-provided documents that describe a single manufacturer.

Rules:
1. Treat the document text as the source of truth. Do not invent facts that are not explicitly present.
2. Fill *every* field in the schema. When data is missing, use "" for strings, [] for arrays, null for numbers, and booleans should default to false.
3. Always return **exactly one JSON array** containing a single company object. No explanations or markdown.
4. Preserve precise language for certifications, capabilities, facilities, and business terms.
5. Respect any slug guidance in the request. If none is provided, derive a URL-safe slug from the company name.
6. Set research_date to the date specified in the user message and include a helpful data_confidence statement (e.g., "Uploaded document").

Schema reminder:
- company_name, slug, website, description, facilities, capabilities, industries, certifications, technical_specs, business_info, research_notes, research_date, data_confidence.
- Facilities must include addresses, countries, and whether each site is primary when available.
- Capabilities should be boolean flags that reflect the document contents.
- Certifications require type, status, and relevant dates if present.

Return JSON only.`

export interface ResearchResult {
  success: boolean
  data?: CompanyFormData
  error?: string
  enrichmentData?: string
  enrichmentRaw?: unknown
}

const adminSupabase =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000
type EnrichmentResponse = Awaited<ReturnType<typeof enrichCompanyData>>

function normalizeCompanyNameForComparison(name?: string | null): string | null {
  if (!name) return null
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function snapshotMatchesRequest(parameters: {
  requestedName?: string
  requestedWebsite?: string
  snapshotName?: string | null
  snapshotWebsite?: string | null
}): boolean {
  const { requestedName, requestedWebsite, snapshotName, snapshotWebsite } = parameters

  if (requestedWebsite && snapshotWebsite) {
    return snapshotWebsite === requestedWebsite
  }

  const normalizedRequest = normalizeCompanyNameForComparison(requestedName)
  const normalizedSnapshot = normalizeCompanyNameForComparison(snapshotName)

  if (!normalizedRequest || !normalizedSnapshot) {
    return false
  }

  return normalizedRequest === normalizedSnapshot
}

interface ParsedCompanyData {
  company_name?: string
  dba_name?: string
  slug?: string
  website?: string
  logo_url?: string
  description?: string
  public_description?: string
  year_founded?: number
  employee_count_range?: string
  annual_revenue_range?: string
  revenue_range?: string
  is_active?: boolean
  is_verified?: boolean
  facilities?: Array<{
    facility_type?: string
    street_address?: string
    city?: string
    state?: string
    state_province?: string
    zip_code?: string
    postal_code?: string
    country?: string
    country_code?: string
    state_code?: string
    facility_size_sqft?: number | null
    employees_at_location?: number | null
    key_capabilities?: string
    is_primary?: boolean
    latitude?: number | string | null
    longitude?: number | string | null
    location?: unknown
  }>
  capabilities?: {
    pcb_assembly_smt?: boolean
    pcb_assembly_through_hole?: boolean
    pcb_assembly_mixed?: boolean
    pcb_assembly_fine_pitch?: boolean
    cable_harness_assembly?: boolean
    box_build_assembly?: boolean
    testing_ict?: boolean
    testing_functional?: boolean
    testing_environmental?: boolean
    testing_rf_wireless?: boolean
    design_services?: boolean
    supply_chain_management?: boolean
    prototyping?: boolean
    low_volume_production?: boolean
    medium_volume_production?: boolean
    high_volume_production?: boolean
    turnkey_services?: boolean
    consigned_services?: boolean
    lead_free_soldering?: boolean
  }
  industries?: Array<{
    industry_name?: string
    is_specialization?: boolean
    years_experience?: number
    notable_projects?: string
  }>
  certifications?: Array<{
    certification_type?: string
    status?: string
    certificate_number?: string
    issue_date?: string
    issued_date?: string
    expiration_date?: string
    issuing_body?: string
    scope?: string
  }>
  technical_specs?: {
    smallest_component_size?: string
    finest_pitch_capability?: string
    max_pcb_size_inches?: string
    max_pcb_layers?: number
    lead_free_soldering?: boolean
    conformal_coating?: boolean
    potting_encapsulation?: boolean
    x_ray_inspection?: boolean
    aoi_inspection?: boolean
    flying_probe_testing?: boolean
    burn_in_testing?: boolean
    clean_room_class?: string
    additional_specs?: string
  }
  business_info?: {
    min_order_qty?: string
    prototype_lead_time?: string
    production_lead_time?: string
    payment_terms?: string
    rush_orders?: boolean
    rush_order_capability?: boolean
    twentyfour_seven?: boolean
    twenty_four_seven_production?: boolean
    engineering_support_hours?: string
    sales_territory?: string
  }
  key_differentiators?: string
  notable_customers?: string
  awards?: string
  research_date?: string
  data_confidence?: string
  research_notes?: string
}

type ParsedFacility = NonNullable<ParsedCompanyData['facilities']>[number]

function sanitizeAiResponse(aiResponse: string): string {
  let cleanedResponse = aiResponse.trim()
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
  }
  return cleanedResponse
}

function parseAiCompanyPayload(aiResponse: string): ParsedCompanyData {
  const cleanedResponse = sanitizeAiResponse(aiResponse)
  const parsed: unknown = JSON.parse(cleanedResponse)
  if (Array.isArray(parsed)) {
    return parsed[0] as ParsedCompanyData
  }
  return parsed as ParsedCompanyData
}

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const mapFacility = (f: ParsedFacility): NonNullable<CompanyFormData['facilities']>[number] => {
  const rawCountryInput = f.country_code || f.country || null
  const normalizedCountryCandidate = rawCountryInput ? normalizeCountryCode(rawCountryInput) : null
  const isoCountryCode =
    normalizedCountryCandidate && /^[A-Z]{2}$/.test(normalizedCountryCandidate)
      ? normalizedCountryCandidate
      : null
  const hasDeclaredCountry = Boolean(rawCountryInput && (rawCountryInput as string).trim?.())

  const rawStateValue = f.state || f.state_province || null
  const normalizedStateCode = normalizeStateFilterValue(rawStateValue)
  let resolvedStateText = f.state || f.state_province || undefined
  if (!resolvedStateText && normalizedStateCode) {
    resolvedStateText = formatStateLabelFromKey(normalizedStateCode)
  }

  const inferredCountry = !hasDeclaredCountry
    ? inferCountryCodeFromStateKey(normalizedStateCode) || inferCountryCodeFromState(resolvedStateText)
    : null

  const finalCountryCode = isoCountryCode || inferredCountry || undefined

  const displayCountry =
    f.country?.toString().trim() ||
    (finalCountryCode ? getCountryName(finalCountryCode) || formatCountryLabel(finalCountryCode) : undefined)

  const streetAddress =
    f.street_address ||
    (typeof (f as { address?: unknown }).address === 'string'
      ? ((f as { address?: string }).address as string)
      : undefined) ||
    (typeof (f as { street?: unknown }).street === 'string'
      ? ((f as { street?: string }).street as string)
      : undefined)

  const primaryValue =
    typeof f.is_primary === 'boolean'
      ? f.is_primary
      : typeof f.is_primary === 'string'
        ? f.is_primary.toLowerCase() === 'true' || f.is_primary.toLowerCase() === 'yes'
        : Boolean(f.is_primary)

  return {
    facility_type: f.facility_type || 'Manufacturing',
    street_address: streetAddress,
    city: f.city || undefined,
    state_province: resolvedStateText,
    state_code: normalizedStateCode || undefined,
    postal_code: f.postal_code || f.zip_code || undefined,
    country: displayCountry,
    country_code: finalCountryCode,
    is_primary: primaryValue,
    latitude: parseCoordinate(f.latitude ?? null),
    longitude: parseCoordinate(f.longitude ?? null),
    location: f.location ?? undefined,
  }
}

interface NormalizeOptions {
  fallbackCompanyName: string
  fallbackWebsite?: string
  enrichedCompanyName?: string | null
}

const capabilityKeywords: Record<keyof NonNullable<CompanyFormData['capabilities']>, Array<string>> = {
  pcb_assembly_smt: ['smt', 'surface mount'],
  pcb_assembly_through_hole: ['through hole', 'tho'],
  pcb_assembly_mixed: ['mixed'],
  pcb_assembly_fine_pitch: ['fine pitch'],
  cable_harness_assembly: ['cable', 'harness'],
  box_build_assembly: ['box build'],
  testing_ict: ['ict'],
  testing_functional: ['functional test'],
  testing_environmental: ['environmental'],
  testing_rf_wireless: ['rf', 'wireless'],
  design_services: ['design'],
  supply_chain_management: ['supply chain'],
  prototyping: ['prototype'],
  low_volume_production: ['low volume'],
  medium_volume_production: ['medium volume'],
  high_volume_production: ['high volume'],
  turnkey_services: ['turnkey'],
  consigned_services: ['consigned'],
}

const createDefaultCapabilities = (): NonNullable<CompanyFormData['capabilities']> => ({
  pcb_assembly_smt: false,
  pcb_assembly_through_hole: false,
  pcb_assembly_mixed: false,
  pcb_assembly_fine_pitch: false,
  cable_harness_assembly: false,
  box_build_assembly: false,
  testing_ict: false,
  testing_functional: false,
  testing_environmental: false,
  testing_rf_wireless: false,
  design_services: false,
  supply_chain_management: false,
  prototyping: false,
  low_volume_production: false,
  medium_volume_production: false,
  high_volume_production: false,
  turnkey_services: false,
  consigned_services: false,
})

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['true', 'yes', '1'].includes(normalized)
  }
  return Boolean(value)
}

const normalizeCapabilities = (
  value: ParsedCompanyData['capabilities']
): NonNullable<CompanyFormData['capabilities']> => {
  const capabilities = createDefaultCapabilities()

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    Object.entries(capabilities).forEach(([key]) => {
      capabilities[key as keyof typeof capabilities] = toBoolean(
        (value as Record<string, unknown>)[key]
      )
    })
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry !== 'string') continue
      const normalizedEntry = entry.toLowerCase()
      for (const [capabilityKey, keywords] of Object.entries(capabilityKeywords)) {
        if (keywords.some(keyword => normalizedEntry.includes(keyword))) {
          capabilities[capabilityKey as keyof typeof capabilities] = true
        }
      }
    }
  }

  return capabilities
}

function normalizeCompanyPayload(parsedData: ParsedCompanyData, options: NormalizeOptions): CompanyFormData {
  const normalizedCapabilities = normalizeCapabilities(parsedData.capabilities)

  const companyData: CompanyFormData = {
    company_name:
      parsedData.company_name || options.enrichedCompanyName || options.fallbackCompanyName,
    dba_name: parsedData.dba_name || undefined,
    description: parsedData.description || parsedData.public_description || undefined,
    website_url: parsedData.website || options.fallbackWebsite || undefined,
    year_founded: parsedData.year_founded || undefined,
    employee_count_range: parsedData.employee_count_range || undefined,
    annual_revenue_range: parsedData.annual_revenue_range || parsedData.revenue_range || undefined,
    key_differentiators: parsedData.key_differentiators || undefined,
    facilities: Array.isArray(parsedData.facilities) ? parsedData.facilities.map(mapFacility) : [],
    capabilities: normalizedCapabilities,
    industries: Array.isArray(parsedData.industries)
      ? parsedData.industries.map((i) => ({
          industry_name: typeof i === 'string' ? i : i.industry_name || '',
        }))
      : [],
    certifications: Array.isArray(parsedData.certifications)
      ? parsedData.certifications.map((c) => {
          if (typeof c === 'string') {
            return {
              certification_type: c,
              certificate_number: undefined,
              status: 'Active' as const,
              issued_date: undefined,
              expiration_date: undefined,
            }
          }

            const validStatuses = ['Active', 'Expired', 'Pending'] as const
            type ValidStatus = (typeof validStatuses)[number]
            const status = c.status as ValidStatus | null | undefined
            const validatedStatus: 'Active' | 'Expired' | 'Pending' | null | undefined =
              status && validStatuses.includes(status as ValidStatus)
              ? (status as 'Active' | 'Expired' | 'Pending')
              : 'Active'

            return {
              certification_type: c.certification_type || '',
              certificate_number: c.certificate_number || undefined,
              status: validatedStatus,
              issued_date: c.issue_date || c.issued_date || undefined,
              expiration_date: c.expiration_date || undefined,
            }
          })
      : [],
    technical_specs: parsedData.technical_specs
      ? {
          smallest_component_size: parsedData.technical_specs.smallest_component_size || undefined,
          finest_pitch_capability: parsedData.technical_specs.finest_pitch_capability || undefined,
          max_pcb_size_inches: parsedData.technical_specs.max_pcb_size_inches || undefined,
          max_pcb_layers: parsedData.technical_specs.max_pcb_layers || undefined,
          lead_free_soldering: parsedData.technical_specs.lead_free_soldering || false,
          conformal_coating: parsedData.technical_specs.conformal_coating || false,
          potting_encapsulation: parsedData.technical_specs.potting_encapsulation || false,
          x_ray_inspection: parsedData.technical_specs.x_ray_inspection || false,
          aoi_inspection: parsedData.technical_specs.aoi_inspection || false,
          flying_probe_testing: parsedData.technical_specs.flying_probe_testing || false,
          burn_in_testing: parsedData.technical_specs.burn_in_testing || false,
          clean_room_class: parsedData.technical_specs.clean_room_class || undefined,
        }
      : {},
    business_info: parsedData.business_info
      ? {
          min_order_qty: parsedData.business_info.min_order_qty || undefined,
          prototype_lead_time: parsedData.business_info.prototype_lead_time || undefined,
          production_lead_time: parsedData.business_info.production_lead_time || undefined,
          payment_terms: parsedData.business_info.payment_terms || undefined,
          rush_order_capability:
            parsedData.business_info.rush_orders || parsedData.business_info.rush_order_capability || false,
          twenty_four_seven_production:
            parsedData.business_info.twentyfour_seven ||
              parsedData.business_info.twenty_four_seven_production || false,
          engineering_support_hours: parsedData.business_info.engineering_support_hours || undefined,
          sales_territory: parsedData.business_info.sales_territory || undefined,
          notable_customers: parsedData.notable_customers || undefined,
          awards_recognition: parsedData.awards || undefined,
        }
      : {},
  }

  return companyData
}

function clipDocumentText(text: string, limit: number = 15000) {
  if (text.length <= limit) {
    return { text, truncated: false }
  }
  return {
    text: text.slice(0, limit),
    truncated: true,
  }
}

function buildDocumentEnrichmentInfo(fileName: string, excerpt: string, truncated: boolean): string {
  const previewLength = 1200
  const preview = excerpt.length > previewLength ? `${excerpt.slice(0, previewLength)}…` : excerpt
  const truncationNote = truncated ? '\n\n[Document truncated for processing]' : ''
  return `Source Document: ${fileName}\n\nExcerpt:\n${preview}${truncationNote}`
}

function extractEnrichedCompanyName(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const candidate =
    (payload as { company_name?: unknown }).company_name ??
    (payload as { name?: unknown }).name
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined
}

async function getCachedEnrichmentSnapshot(companyName: string, website?: string) {
  if (!adminSupabase) {
    return null
  }

  const trimmedName = companyName.trim()
  const normalizedWebsite = website ? normalizeWebsiteUrl(website) : undefined
  if (!trimmedName && !normalizedWebsite) {
    return null
  }

  const thirtyDaysAgo = new Date(Date.now() - ONE_MONTH_MS).toISOString()

  let query = adminSupabase
    .from('company_research_history')
    .select('enrichment_snapshot, created_at, company_name, website_url')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })

  if (normalizedWebsite) {
    query = query.eq('website_url', normalizedWebsite)
  } else {
    const sanitizedName = trimmedName.replace(/%/g, '\\%').replace(/_/g, '\\_')
    query = query.ilike('company_name', sanitizedName)
  }

  const { data, error } = await query.limit(5)

  if (error) {
    console.warn('Unable to fetch cached enrichment snapshot:', error)
    return null
  }

  const matchingEntry = data?.find(entry =>
    snapshotMatchesRequest({
      requestedName: trimmedName,
      requestedWebsite: normalizedWebsite,
      snapshotName: entry.company_name,
      snapshotWebsite: entry.website_url ?? undefined,
    })
  )

  const snapshot = matchingEntry?.enrichment_snapshot
  if (snapshot) {
    console.log('⚡ Using cached enrichment snapshot from research history (skipping ZoomInfo)')
  } else if (data && data.length > 0) {
    console.log('ℹ️  Cached enrichment snapshot ignored due to non-matching company metadata')
  }
  return snapshot ?? null
}

/**
 * Research a single company using ZoomInfo and OpenAI
 */
export async function researchCompany(
  companyName: string,
  website?: string
): Promise<ResearchResult> {
  try {
    // Step 1: Call ZoomInfo enrichment (or reuse cached snapshot)
    console.log(`🤖 Starting research for: ${companyName}`)
    console.log(`Enriching data for ${companyName}...`)

    let enrichmentResponse: EnrichmentResponse
    const cachedSnapshot = await getCachedEnrichmentSnapshot(companyName, website)

    if (cachedSnapshot) {
      enrichmentResponse = {
        success: true,
        data: cachedSnapshot,
      }
    } else {
      enrichmentResponse = await enrichCompanyData(companyName, website)
    }

    const enrichmentPayload = enrichmentResponse.data ?? null
    const enrichedCompanyName = extractEnrichedCompanyName(enrichmentPayload)
    const effectiveCompanyName = enrichedCompanyName || companyName

    console.log('📊 ZoomInfo enrichment result:', {
      success: enrichmentResponse.success,
      hasData: !!enrichmentResponse.data,
      error: enrichmentResponse.error
    })
    
    const enrichmentDataString = formatEnrichmentData(enrichmentResponse)
    
    // Log if enrichment was successful
    if (enrichmentResponse.success && enrichmentResponse.data) {
      console.log('✅ ZoomInfo enrichment SUCCESSFUL - Data will be included in OpenAI prompt')
      console.log('📋 ZoomInfo data being sent to OpenAI:')
      console.log(enrichmentDataString)
    } else {
      console.warn('⚠️  ZoomInfo enrichment FAILED or returned no data')
      console.warn('OpenAI will rely on public web research only')
    }

    // Step 2: Prepare user message with enrichment data
    const userMessage = `Research the following company and return complete JSON data:

Company Name: ${effectiveCompanyName}
${website ? `Website: ${website}` : ''}

ZoomInfo Enrichment Data:
${enrichmentDataString}

Please research this company thoroughly and return a complete JSON object with all fields filled according to the schema. Use the ZoomInfo data as a starting point, but enhance it with additional research from public sources, the company website, and industry knowledge.

Remember:
- Return ONLY valid JSON, no markdown or explanations
- Fill ALL fields - use empty strings/arrays/null for missing data
- The response must be a single JSON array containing one company object
- Generate a URL-friendly slug from the company name
- Set research_date to today's date: ${new Date().toISOString().split('T')[0]}
- Include comprehensive capabilities, facilities, and certifications data`

    // Step 3: Call OpenAI with system prompt
    console.log('📡 Calling OpenAI for research...')
    console.log('📨 Full prompt being sent to OpenAI (length: ' + userMessage.length + ' chars)')
    
    const aiResponse = await callOpenAI(SYSTEM_PROMPT, userMessage, 0.3)
    
    console.log('✅ OpenAI response received (length: ' + aiResponse.length + ' chars)')

    // Step 4: Parse and validate JSON response
    let parsedData: ParsedCompanyData
    try {
      parsedData = parseAiCompanyPayload(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
        enrichmentData: enrichmentDataString,
        enrichmentRaw: enrichmentPayload,
      }
    }

    const companyData = normalizeCompanyPayload(parsedData, {
      fallbackCompanyName: companyName,
      fallbackWebsite: website,
      enrichedCompanyName,
    })

    // Log final results summary
    console.log('\n=== 🎯 RESEARCH COMPLETE ===')
    console.log(`Company: ${companyData.company_name}`)
    console.log(`Facilities: ${companyData.facilities?.length || 0}`)
    console.log(`Capabilities: ${Object.values(companyData.capabilities || {}).filter(Boolean).length}`)
    console.log(`Industries: ${companyData.industries?.length || 0}`)
    console.log(`Certifications: ${companyData.certifications?.length || 0}`)
    console.log(`Business Info Fields: ${Object.values(companyData.business_info || {}).filter(v => v !== undefined && v !== null).length}`)
    console.log(`Technical Specs Fields: ${Object.values(companyData.technical_specs || {}).filter(v => v !== undefined && v !== null).length}`)
    console.log('=======================\n')

    return {
      success: true,
      data: companyData,
      enrichmentData: enrichmentDataString,
      enrichmentRaw: enrichmentPayload,
    }
  } catch (error) {
    console.error('Error researching company:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      enrichmentRaw: null,
    }
  }
}

interface DocumentResearchOptions {
  documentText: string
  fileName: string
  companyNameHint?: string
  companySlugHint?: string
  createNew?: boolean
}

export async function researchCompanyFromDocument(options: DocumentResearchOptions): Promise<ResearchResult> {
  try {
    const trimmedDocument = options.documentText.trim()
    if (!trimmedDocument) {
      return {
        success: false,
        error: 'The uploaded document did not contain any readable text.',
        enrichmentRaw: null,
      }
    }

    const todaysDate = new Date().toISOString().split('T')[0]
    const { text: clippedText, truncated } = clipDocumentText(trimmedDocument)
    const slugGuidance = options.companySlugHint
      ? `Use this slug exactly: ${options.companySlugHint}.`
      : options.createNew
        ? 'Generate a URL-friendly slug from the document company name.'
        : 'If the document references an existing slug, reuse it. Otherwise derive one from the company name.'

    const userMessage = `Convert the following first-party company document into the manufacturing schema JSON.

Document Title: ${options.fileName}
Company Name Hint: ${options.companyNameHint || 'Unknown'}
Slug Guidance: ${slugGuidance}
Set research_date to today's date: ${todaysDate}

Document Text (authoritative):
"""
${clippedText}
"""
${truncated ? '\n[Document truncated for model input]\n' : ''}

Use only the document. If data is absent, leave the field empty (""), null, or [] as appropriate.`

    console.log('📄 Processing uploaded document via OpenAI...')
    const aiResponse = await callOpenAI(DOCUMENT_SYSTEM_PROMPT, userMessage, 0.2)

    let parsedData: ParsedCompanyData
    try {
      parsedData = parseAiCompanyPayload(aiResponse)
    } catch (error) {
      console.error('Failed to parse document AI response:', error)
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
        enrichmentRaw: null,
      }
    }

    const companyData = normalizeCompanyPayload(parsedData, {
      fallbackCompanyName: options.companyNameHint || 'Uploaded Company',
      enrichedCompanyName: options.companyNameHint || undefined,
    })

    const enrichmentInfo = buildDocumentEnrichmentInfo(options.fileName, clippedText, truncated)

    return {
      success: true,
      data: companyData,
      enrichmentData: enrichmentInfo,
      enrichmentRaw: {
        source: 'document_upload',
        fileName: options.fileName,
        truncated,
      },
    }
  } catch (error) {
    console.error('Error processing uploaded document:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      enrichmentRaw: null,
    }
  }
}

/**
 * Research multiple companies in sequence
 */
export async function researchBatchCompanies(
  companies: Array<{ name: string; website?: string }>,
    onProgress?: (index: number, total: number, company: string) => void,
    delayMs: number = 1000
): Promise<ResearchResult[]> {
  const results: ResearchResult[] = []

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    
    if (onProgress) {
      onProgress(i + 1, companies.length, company.name)
    }

    const result = await researchCompany(company.name, company.website)
    results.push(result)

    // Add a small delay between requests to avoid rate limiting
    if (i < companies.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}
