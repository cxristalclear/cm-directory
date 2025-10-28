/**
 * Main Company Research Logic with Enhanced Validation Logging
 * Orchestrates ZoomInfo enrichment and OpenAI research
 */

import { callOpenAI } from './openaiClient'
import { enrichCompanyData, formatEnrichmentData } from './zoomInfoEnrich'
import type {
  BusinessInfoFormData,
  CapabilitiesFormData,
  CertificationFormData,
  CompanyFormData,
  FacilityFormData,
  IndustryFormData,
  TechnicalSpecsFormData,
} from '@/types/admin'

// System prompt from custom_cm_search_instructions.txt
const SYSTEM_PROMPT = `You are a B2B company data researcher specializing in electronics manufacturing. Your goal is to return accurate, verified data about manufacturing companies in a structured JSON format.

# CORE PRINCIPLES (CRITICAL)
1. **ACCURACY OVER COMPLETENESS** - Only include information you can verify from reliable sources
2. **NO FABRICATION** - If data is not available, leave it as null/empty - do NOT make up information
3. **NO ASSUMPTIONS** - Do not infer capabilities or details that aren't explicitly stated
4. **VERIFY ADDRESSES** - Only include facility locations with verifiable city AND state information

# RESPONSE FORMAT
Return a single JSON object (not an array) with this structure. Use null for unknown values, never use placeholder text.

{
  "company_name": "string (REQUIRED)",
  "dba_name": null,
  "website_url": "string (REQUIRED - use actual URL if found)",
  "description": "string (2-3 sentence overview from company's about page)",
  "year_founded": null,
  "employee_count_range": null,
  "annual_revenue_range": null,
  "key_differentiators": null,
  
  "facilities": [
    {
      "facility_type": "HQ | Manufacturing | Engineering | Sales Office",
      "street_address": null,
      "city": "REQUIRED - must be real verified city",
      "state": "REQUIRED - must be real verified 2-letter state code (e.g., CA, TX, NY)",
      "zip_code": null,
      "country": "US",
      "is_primary": true
    }
  ],
  
  "capabilities": {
    "pcb_assembly_smt": false,
    "pcb_assembly_through_hole": false,
    "pcb_assembly_mixed": false,
    "pcb_assembly_fine_pitch": false,
    "cable_harness_assembly": false,
    "box_build_assembly": false,
    "testing_ict": false,
    "testing_functional": false,
    "testing_environmental": false,
    "testing_rf_wireless": false,
    "design_services": false,
    "supply_chain_management": false,
    "prototyping": false,
    "low_volume_production": false,
    "medium_volume_production": false,
    "high_volume_production": false,
    "turnkey_services": false,
    "consigned_services": false
  },
  
  "industries": [
    {
      "industry_name": "string (e.g., Medical Devices, Aerospace, Industrial)"
    }
  ],
  
  "certifications": [
    {
      "certification_type": "string (e.g., ISO 9001, ISO 13485, AS9100)",
      "status": "Active",
      "certificate_number": null,
      "issued_date": null,
      "expiration_date": null
    }
  ],
  
  "technical_specs": {
    "smallest_component_size": null,
    "finest_pitch_capability": null,
    "max_pcb_size_inches": null,
    "max_pcb_layers": null,
    "lead_free_soldering": false,
    "conformal_coating": false,
    "potting_encapsulation": false,
    "x_ray_inspection": false,
    "aoi_inspection": false,
    "flying_probe_testing": false,
    "burn_in_testing": false,
    "clean_room_class": null
  },
  
  "business_info": {
    "min_order_qty": null,
    "prototype_lead_time": null,
    "production_lead_time": null,
    "payment_terms": null,
    "rush_order_capability": false,
    "twenty_four_seven_production": false,
    "engineering_support_hours": null,
    "sales_territory": null,
    "notable_customers": null,
    "awards_recognition": null
  }
}

# CRITICAL FIELD RULES

## FACILITIES (MOST IMPORTANT)
⚠️ **CRITICAL FACILITY RULES - FOLLOW EXACTLY:**
- If you find a verifiable facility location, you MUST include BOTH city AND state
- City must be a real, specific city name (e.g., "Austin", "San Diego", "Phoenix")
- State must be a valid 2-letter US state code (e.g., "TX", "CA", "AZ", "NY")
- If you ONLY find "California" or "United States" without a specific city, return facilities: []
- If you ONLY find a country without city/state, return facilities: []
- Do NOT use "San Jose, CA" as a default - only use it if explicitly verified
- Do NOT infer locations from area codes, time zones, or vague references
- Valid sources: company website contact page, about page, Google Maps listing, LinkedIn company page
- facility_type options: "HQ", "Manufacturing", "Engineering", "Sales Office"
- Set is_primary: true for the headquarters or main location

**Examples of VALID facility data:**
✅ { "city": "Austin", "state": "TX", "facility_type": "HQ" }
✅ { "city": "San Jose", "state": "CA", "street_address": "1234 Technology Dr" }
✅ { "city": "Phoenix", "state": "AZ", "facility_type": "Manufacturing" }

**Examples of INVALID facility data:**
❌ { "city": null, "state": "CA" } - missing city
❌ { "city": "California", "state": "CA" } - city is actually a state
❌ { "country": "US" } - missing city and state
❌ { "city": "San Jose", "state": "CA" } - when you're not sure and just guessing

## COMPANY NAME & WEBSITE
- company_name: Use official legal name or DBA from website/ZoomInfo
- website_url: Must be valid URL starting with http:// or https://
- description: 2-3 sentences from company's website about page, NOT marketing copy

## EMPLOYEE COUNT & REVENUE
- Only use these ranges: 
  - employee_count_range: "<50" | "50-150" | "150-500" | "500-1000" | "1000+"
  - annual_revenue_range: "<$10M" | "$10M-50M" | "$50M-150M" | "$150M+"
- Use null if not found in ZoomInfo data or company website

## CAPABILITIES
- Set to true if stated on company website or in ZoomInfo data
- Look for: services page, capabilities page, process descriptions
- Keywords to look for:
  - "SMT assembly", "surface mount" → pcb_assembly_smt: true
  - "through-hole", "thru-hole" → pcb_assembly_through_hole: true
  - "box build", "system integration" → box_build_assembly: true
  - "design services", "DFM" → design_services: true
  - "prototyping", "NPI" → prototyping: true
  - "turnkey" → turnkey_services: true
  - "consignment" → consigned_services: true
- Default all to false if not mentioned

## INDUSTRIES
- Only include industries explicitly mentioned on website or in ZoomInfo
- Use standard names: Medical Devices, Aerospace, Industrial, Automotive, Consumer Electronics, Telecommunications, Defense, IoT
- Do NOT infer from location or other context

## CERTIFICATIONS
- Only include if explicitly listed on website (usually on About, Quality, or Certifications page)
- Common ones: ISO 9001, ISO 13485, AS9100, IPC-A-610, ISO 14001, ITAR
- Set status to "Active" unless explicitly stated as expired
- Leave dates as null unless found

## TECHNICAL SPECS
- Only populate if found in technical specifications or capabilities pages
- smallest_component_size: "01005", "0201", "0402", etc.
- finest_pitch_capability: "0.3mm", "0.4mm", "0.5mm", etc.
- max_pcb_size_inches: "18x24", "20x24", etc.
- max_pcb_layers: integer only if explicitly stated
- Boolean fields: true only if explicitly mentioned

## BUSINESS INFO
- min_order_qty: Use exact phrasing if found (e.g., "No minimum", "100 units", "$1000")
- lead times: Use format like "2-3 weeks", "4-6 weeks"
- payment_terms: "Net 30", "Net 60", "50% upfront", etc.
- Only include if explicitly stated on website

# RESEARCH PROCESS

1. **Start with ZoomInfo data** - Use provided enrichment data as foundation
2. **Visit company website** - Prioritize About, Capabilities, Services, Contact pages
3. **Verify critical fields** - Double-check facility locations against multiple sources
4. **Set booleans conservatively** - Only true if explicitly confirmed
5. **Leave gaps** - Use null/empty for missing data rather than guessing

# DATA SOURCES PRIORITY
1. Company's official website (highest priority)
2. ZoomInfo enrichment data
3. LinkedIn company page
4. Industry directories (IPC, ECIA, etc.)
5. Do NOT use: Yelp, random blogs, outdated archived pages

# QUALITY CHECKS BEFORE RETURNING

✅ Verify:
- [ ] company_name is the official company name
- [ ] website_url is valid and accessible
- [ ] Every facility has BOTH city AND state, or facilities array is empty
- [ ] No facility uses "San Jose, CA" unless explicitly verified
- [ ] Capabilities are explicitly stated, not assumed
- [ ] Certifications are from official sources
- [ ] No placeholder or fake data anywhere

# OUTPUT REQUIREMENTS
- Return ONLY valid JSON
- No markdown code blocks (no \`\`\`json)
- No explanatory text before or after JSON
- No comments within JSON
- All strings properly escaped
- All dates in "YYYY-MM-DD" format if included

Remember: It is better to return minimal accurate data than complete fabricated data. When in doubt, use null or empty arrays.`;

export interface ResearchResult {
  success: boolean
  data?: CompanyFormData
  error?: string
  enrichmentData?: string
}

const truthyStrings = new Set(['true', 'yes', 'y', '1'])
const falsyStrings = new Set(['false', 'no', 'n', '0'])

const ensureBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (truthyStrings.has(normalized)) {
      return true
    }
    if (falsyStrings.has(normalized)) {
      return false
    }
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true
    }
    if (value === 0) {
      return false
    }
  }
  return undefined
}

const mergeBoolean = (preferred: unknown, fallback: boolean = false): boolean => {
  const normalized = ensureBoolean(preferred)
  if (normalized !== undefined) {
    return normalized
  }
  return fallback
}

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return undefined
}

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ''))
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return undefined
}

const normalizeArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is T => item != null)
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|\n]/)
      .map(part => part.trim())
      .filter(Boolean) as unknown as T[]
  }
  if (value && typeof value === 'object') {
    return [value as T]
  }
  return []
}

const normalizeFacility = (facility: Record<string, unknown>): FacilityFormData => {
  const street =
    normalizeString(facility.street_address) ??
    normalizeString(facility.streetAddress) ??
    normalizeString(facility.address) ??
    normalizeString(facility.street)

  const state =
    normalizeString(facility.state) ??
    normalizeString(facility.state_province) ??
    normalizeString(facility.province)

  const zip =
    normalizeString(facility.zip_code) ??
    normalizeString(facility.zipCode) ??
    normalizeString(facility.postal_code) ??
    normalizeString(facility.zip)

  return {
    facility_type: normalizeString(facility.facility_type) ?? 'Manufacturing',
    street_address: street,
    city: normalizeString(facility.city),
    state,
    zip_code: zip,
    country: normalizeString(facility.country) ?? 'US',
    is_primary: mergeBoolean(facility.is_primary, false),
    latitude: normalizeNumber(facility.latitude) ?? null,
    longitude: normalizeNumber(facility.longitude) ?? null,
    location: facility.location ?? undefined,
  }
}

const normalizeCapabilities = (raw: unknown): CapabilitiesFormData => {
  if (!raw) {
    return {}
  }

  // Handle simple string array results
  if (Array.isArray(raw)) {
    const entries = normalizeArray<string>(raw).map(item => item.toLowerCase())
    const includes = (key: string): boolean => entries.some(entry => entry.includes(key))
    return {
      pcb_assembly_smt: includes('smt'),
      pcb_assembly_through_hole: includes('through'),
      pcb_assembly_mixed: includes('mixed'),
      pcb_assembly_fine_pitch: includes('fine pitch'),
      cable_harness_assembly: includes('cable') || includes('harness'),
      box_build_assembly: includes('box build') || includes('box-build'),
      testing_ict: includes('ict'),
      testing_functional: includes('functional'),
      testing_environmental: includes('environmental'),
      testing_rf_wireless: includes('rf') || includes('wireless'),
      design_services: includes('design'),
      supply_chain_management: includes('supply'),
      prototyping: includes('prototype'),
      low_volume_production: includes('low volume'),
      medium_volume_production: includes('medium volume'),
      high_volume_production: includes('high volume'),
      turnkey_services: includes('turnkey'),
      consigned_services: includes('consigned'),
    }
  }

  if (typeof raw !== 'object' || raw === null) {
    return {}
  }

  const obj = raw as Record<string, unknown>

  const mapBoolean = (key: keyof CapabilitiesFormData, fallbackKey?: string): boolean => {
    const value = obj[key as string] ?? (fallbackKey ? obj[fallbackKey] : undefined)
    return mergeBoolean(value, false)
  }

  return {
    pcb_assembly_smt: mapBoolean('pcb_assembly_smt'),
    pcb_assembly_through_hole: mapBoolean('pcb_assembly_through_hole'),
    pcb_assembly_mixed: mapBoolean('pcb_assembly_mixed'),
    pcb_assembly_fine_pitch: mapBoolean('pcb_assembly_fine_pitch'),
    cable_harness_assembly: mapBoolean('cable_harness_assembly'),
    box_build_assembly: mapBoolean('box_build_assembly'),
    testing_ict: mapBoolean('testing_ict'),
    testing_functional: mapBoolean('testing_functional'),
    testing_environmental: mapBoolean('testing_environmental'),
    testing_rf_wireless: mapBoolean('testing_rf_wireless'),
    design_services: mapBoolean('design_services'),
    supply_chain_management: mapBoolean('supply_chain_management'),
    prototyping: mapBoolean('prototyping'),
    low_volume_production: mapBoolean('low_volume_production'),
    medium_volume_production: mapBoolean('medium_volume_production'),
    high_volume_production: mapBoolean('high_volume_production'),
    turnkey_services: mapBoolean('turnkey_services'),
    consigned_services: mapBoolean('consigned_services'),
  }
}

const normalizeIndustries = (raw: unknown): IndustryFormData[] => {
  if (!raw) {
    return []
  }

  if (Array.isArray(raw)) {
    return raw
      .map(item => {
        if (typeof item === 'string') {
          const industry = normalizeString(item)
          return industry ? { industry_name: industry } : undefined
        }
        if (typeof item === 'object' && item) {
          const industry = normalizeString((item as Record<string, unknown>).industry_name)
          return industry ? { industry_name: industry } : undefined
        }
        return undefined
      })
      .filter((item): item is IndustryFormData => Boolean(item))
  }

  if (typeof raw === 'string') {
    return normalizeArray<string>(raw).map(industry => ({ industry_name: industry }))
  }

  return []
}

const normalizeCertifications = (raw: unknown): CertificationFormData[] => {
  const validStatuses: CertificationFormData['status'][] = ['Active', 'Expired', 'Pending']
  if (!raw) {
    return []
  }

  return normalizeArray<unknown>(raw).map(item => {
    if (typeof item === 'string') {
      const name = normalizeString(item)
      return {
        certification_type: name ?? '',
        status: 'Active',
      }
    }

    if (typeof item !== 'object' || item === null) {
      return {
        certification_type: '',
        status: 'Active',
      }
    }

    const entry = item as Record<string, unknown>
    const rawStatus = normalizeString(entry.status)
    const status = validStatuses.find(candidate => candidate === rawStatus) ?? 'Active'

    return {
      certification_type: normalizeString(entry.certification_type) ?? '',
      certificate_number: normalizeString(entry.certificate_number),
      status,
      issued_date: normalizeString(entry.issue_date) ?? normalizeString(entry.issued_date),
      expiration_date: normalizeString(entry.expiration_date),
    }
  })
}

const normalizeTechnicalSpecs = (raw: unknown): TechnicalSpecsFormData => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const specs = raw as Record<string, unknown>

  return {
    smallest_component_size: normalizeString(specs.smallest_component_size),
    finest_pitch_capability: normalizeString(specs.finest_pitch_capability),
    max_pcb_size_inches: normalizeString(specs.max_pcb_size_inches),
    max_pcb_layers: normalizeNumber(specs.max_pcb_layers),
    lead_free_soldering: mergeBoolean(specs.lead_free_soldering, false),
    conformal_coating: mergeBoolean(specs.conformal_coating, false),
    potting_encapsulation: mergeBoolean(specs.potting_encapsulation, false),
    x_ray_inspection: mergeBoolean(specs.x_ray_inspection, false),
    aoi_inspection: mergeBoolean(specs.aoi_inspection, false),
    flying_probe_testing: mergeBoolean(specs.flying_probe_testing, false),
    burn_in_testing: mergeBoolean(specs.burn_in_testing, false),
    clean_room_class: normalizeString(specs.clean_room_class),
  }
}

const normalizeBusinessInfo = (raw: unknown): BusinessInfoFormData => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const info = raw as Record<string, unknown>

  return {
    min_order_qty: normalizeString(info.min_order_qty),
    prototype_lead_time: normalizeString(info.prototype_lead_time),
    production_lead_time: normalizeString(info.production_lead_time),
    payment_terms: normalizeString(info.payment_terms),
    rush_order_capability: mergeBoolean(info.rush_order_capability ?? info.rush_orders, false),
    twenty_four_seven_production: mergeBoolean(
      info.twenty_four_seven_production ?? info.twentyfour_seven,
      false
    ),
    engineering_support_hours: normalizeString(info.engineering_support_hours),
    sales_territory: normalizeString(info.sales_territory),
    notable_customers: normalizeString(info.notable_customers),
    awards_recognition: normalizeString(info.awards_recognition ?? info.awards),
  }
}

/**
 * Research a single company using ZoomInfo and OpenAI
 */
export async function researchCompany(
  companyName: string,
  website?: string
): Promise<ResearchResult> {
  try {
    console.log(`Starting research for: ${companyName}`)
    console.log(`Enriching data for ${companyName}...`)

    const enrichmentResponse = await enrichCompanyData(companyName, website)

    console.log('ZoomInfo enrichment result:', {
      success: enrichmentResponse.success,
      hasData: Boolean(enrichmentResponse.data),
      error: enrichmentResponse.error,
    })

    const enrichmentDataString = formatEnrichmentData(enrichmentResponse)
    console.log('Formatted enrichment data:', enrichmentDataString)

    const baseUserMessage = `Research and return complete JSON data for the following company:

**Company Name:** ${companyName}
${website ? `**Website:** ${website}` : '**Website:** Not provided - please find it'}

**ZoomInfo Enrichment Data:**
${enrichmentDataString || 'No enrichment data available - rely on web research'}

**Instructions:**
1. Visit the company's website if available
2. Find their About, Capabilities, Services, and Contact pages
3. Verify the facility location - MUST have both city AND state
4. Only mark capabilities as true if explicitly mentioned
5. Return accurate, verified data only
6. Use null for any data you cannot verify

**Current Date:** ${new Date().toISOString().split('T')[0]}

Return a single JSON object (not an array) following the exact schema provided in the system prompt.`

    const MAX_ATTEMPTS = 2
    let attempt = 0
    let currentUserMessage = baseUserMessage
    let parsedData: ParsedCompanyData | null = null
    let companyData: CompanyFormData | null = null
    let lastParseError: Error | null = null
    let missingSections: string[] = []

    while (attempt < MAX_ATTEMPTS) {
      attempt += 1
      console.log(`Calling OpenAI for research... (attempt ${attempt})`)
      const temperature = attempt === 1 ? 0.3 : 0.2

      const aiResponse = await callOpenAI(SYSTEM_PROMPT, currentUserMessage, temperature)

      try {
        parsedData = aiResponse(aiResponse)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError)
        lastParseError = parseError instanceof Error ? parseError : new Error(String(parseError))

        if (attempt >= MAX_ATTEMPTS) {
          return {
            success: false,
            error: 'Failed to parse AI response as JSON',
            enrichmentData: enrichmentDataString,
          }
        }

        currentUserMessage = `${baseUserMessage}

The previous response could not be parsed as valid JSON. Please return a single JSON object that matches the required schema.`
        continue
      }

      companyData = mapParsedCompanyData(parsedData, companyName, website)
      missingSections = missingSections(companyData)

      if (missingSections.length === 0 || attempt >= MAX_ATTEMPTS) {
        if (missingSections.length > 0) {
          console.warn(`Missing sections after attempt ${attempt}: ${missingSections.join(', ')}`)
        }
        break
      }

      console.warn(
        `AI response missing sections (${missingSections.join(', ')}). Requesting retry.`
      )

      currentUserMessage = `${baseUserMessage}

The previous JSON response was missing verified data for: ${missingSections.join(', ')}.
Research the company again using the provided ZoomInfo data and official sources. Preserve accurate facts already supplied while adding details for the missing sections when evidence exists.

Previous response:
${JSON.stringify(parsedData, null, 2)}
`
    }

    if (!companyData) {
      const errorMessage = lastParseError?.message ?? 'Failed to obtain AI research data'
      return {
        success: false,
        error: errorMessage,
        enrichmentData: enrichmentDataString,
      }
    }

    const capabilitiesCount = countEnabledCapabilities(companyData.capabilities)
    const techSpecsCount = countFilledTechnicalSpecs(companyData.technical_specs)
    const businessInfoCount = countFilledBusinessInfo(companyData.business_info)

    console.log('\n=== AI RESEARCH DATA VALIDATION ===')
    console.log(`Facilities: ${companyData.facilities?.length || 0} found`)
    if (!companyData.facilities || companyData.facilities.length === 0) {
      console.warn('WARNING: AI returned no facilities data')
    }
    console.log(`Capabilities: ${capabilitiesCount} enabled`)
    if (capabilitiesCount === 0) {
      console.warn('WARNING: AI returned no enabled capabilities')
    }
    console.log(`Industries: ${companyData.industries?.length || 0} found`)
    if (!companyData.industries || companyData.industries.length === 0) {
      console.warn('WARNING: AI returned no industries data')
    }
    console.log(`Certifications: ${companyData.certifications?.length || 0} found`)
    if (!companyData.certifications || companyData.certifications.length === 0) {
      console.warn('WARNING: AI returned no certifications data')
    }
    console.log(`Technical Specs: ${techSpecsCount} fields filled`)
    if (techSpecsCount === 0) {
      console.warn('WARNING: AI returned no technical specs data')
    }
    console.log(`Business Info: ${businessInfoCount} fields filled`)
    if (businessInfoCount === 0) {
      console.warn('WARNING: AI returned no business info data')
    }
    if (missingSections.length > 0) {
      console.warn(`Sections still missing after retries: ${missingSections.join(', ')}`)
    }
    console.log('===================================\n')

    return {
      success: true,
      data: companyData,
      enrichmentData: enrichmentDataString,
    }
  } catch (error) {
    console.error('Error researching company:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Parse batch input (CSV format: name, website)
 */
export function parseBatchInput(input: string): Array<{ name: string; website?: string }> {
  const lines = input.trim().split('\n')
  const companies: Array<{ name: string; website?: string }> = []

  for (const line of lines) {
    if (!line.trim()) continue

    const parts = line.split(',').map(p => p.trim())
    if (parts.length >= 1) {
      companies.push({
        name: parts[0],
        website: parts[1] || undefined,
      })
    }
  }

  return companies
}

/**
 * Research multiple companies in sequence
 */
export async function researchBatchCompanies(
  companies: Array<{ name: string; website?: string }>,
  onProgress?: (index: number, total: number, company: string) => void
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
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
