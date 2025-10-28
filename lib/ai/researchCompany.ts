/**
 * Main Company Research Logic with Enhanced Validation Logging
 * Orchestrates ZoomInfo enrichment and OpenAI research
 */

import { callOpenAI } from './openaiClient'
import { enrichCompanyData, formatEnrichmentData } from './zoomInfoEnrich'
import type { CompanyFormData } from '@/types/admin'

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
- Set to true ONLY if explicitly stated on company website or in ZoomInfo data
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

/**
 * Research a single company using ZoomInfo and OpenAI
 */
export async function researchCompany(
  companyName: string,
  website?: string
): Promise<ResearchResult> {
  try {
    // Step 1: Call ZoomInfo enrichment
    console.log(`🤖 Starting research for: ${companyName}`)
    console.log(`Enriching data for ${companyName}...`)
    
    const enrichmentResponse = await enrichCompanyData(companyName, website)
    
    console.log('📊 ZoomInfo enrichment result:', {
      success: enrichmentResponse.success,
      hasData: !!enrichmentResponse.data,
      error: enrichmentResponse.error
    })
    
    const enrichmentDataString = formatEnrichmentData(enrichmentResponse)
    console.log('📝 Formatted enrichment data:', enrichmentDataString)

    // Step 2: Prepare user message with enrichment data
    const userMessage = `Research and return complete JSON data for the following company:

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

    // Step 3: Call OpenAI with improved system prompt
    console.log('Calling OpenAI for research...')
    const aiResponse = await callOpenAI(SYSTEM_PROMPT, userMessage, 0.3)

    // Step 4: Parse and validate JSON response
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
        zip_code?: string
        country?: string
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

    let parsedData: ParsedCompanyData
    try {
      // Remove any markdown code blocks if present
      let cleanedResponse = aiResponse.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
      }

      const parsed: unknown = JSON.parse(cleanedResponse)
      
      // If it's an array, get the first element
      if (Array.isArray(parsed)) {
        parsedData = parsed[0] as ParsedCompanyData
      } else {
        parsedData = parsed as ParsedCompanyData
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
        enrichmentData: enrichmentDataString,
      }
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

    // Step 5: Map to CompanyFormData structure
    const companyData: CompanyFormData = {
      company_name: parsedData.company_name || companyName,
      dba_name: parsedData.dba_name || undefined,
      description: parsedData.description || parsedData.public_description || undefined,
      website_url: parsedData.website || website || undefined,
      year_founded: parsedData.year_founded || undefined,
      employee_count_range: parsedData.employee_count_range || undefined,
      annual_revenue_range: parsedData.annual_revenue_range || parsedData.revenue_range || undefined,
      key_differentiators: parsedData.key_differentiators || undefined,

      // Map facilities
      facilities: Array.isArray(parsedData.facilities) 
        ? parsedData.facilities.map((f) => ({
            facility_type: f.facility_type || 'Manufacturing',
            street_address: f.street_address || undefined,
            city: f.city || undefined,
            state: f.state || undefined,
            zip_code: f.zip_code || undefined,
            country: f.country || 'US',
            is_primary: f.is_primary || false,
            latitude: parseCoordinate(f.latitude ?? null),
            longitude: parseCoordinate(f.longitude ?? null),
            location: f.location ?? undefined,
          }))
        : [],

      // Map capabilities
      capabilities: parsedData.capabilities ? {
        pcb_assembly_smt: parsedData.capabilities.pcb_assembly_smt || false,
        pcb_assembly_through_hole: parsedData.capabilities.pcb_assembly_through_hole || false,
        pcb_assembly_mixed: parsedData.capabilities.pcb_assembly_mixed || false,
        pcb_assembly_fine_pitch: parsedData.capabilities.pcb_assembly_fine_pitch || false,
        cable_harness_assembly: parsedData.capabilities.cable_harness_assembly || false,
        box_build_assembly: parsedData.capabilities.box_build_assembly || false,
        testing_ict: parsedData.capabilities.testing_ict || false,
        testing_functional: parsedData.capabilities.testing_functional || false,
        testing_environmental: parsedData.capabilities.testing_environmental || false,
        testing_rf_wireless: parsedData.capabilities.testing_rf_wireless || false,
        design_services: parsedData.capabilities.design_services || false,
        supply_chain_management: parsedData.capabilities.supply_chain_management || false,
        prototyping: parsedData.capabilities.prototyping || false,
        low_volume_production: parsedData.capabilities.low_volume_production || false,
        medium_volume_production: parsedData.capabilities.medium_volume_production || false,
        high_volume_production: parsedData.capabilities.high_volume_production || false,
        turnkey_services: parsedData.capabilities.turnkey_services || false,
        consigned_services: parsedData.capabilities.consigned_services || false,
      } : {},

      // Map industries
      industries: Array.isArray(parsedData.industries)
        ? parsedData.industries.map((i) => ({
            industry_name: i.industry_name || '',
          }))
        : [],

      // Map certifications
      certifications: Array.isArray(parsedData.certifications)
        ? parsedData.certifications.map((c) => {
            // Validate status to match the strict type
            const validStatuses = ['Active', 'Expired', 'Pending'] as const
            type ValidStatus = typeof validStatuses[number]
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

      // Map technical specs
      technical_specs: parsedData.technical_specs ? {
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
      } : {},

      // Map business info
      business_info: parsedData.business_info ? {
        min_order_qty: parsedData.business_info.min_order_qty || undefined,
        prototype_lead_time: parsedData.business_info.prototype_lead_time || undefined,
        production_lead_time: parsedData.business_info.production_lead_time || undefined,
        payment_terms: parsedData.business_info.payment_terms || undefined,
        rush_order_capability: parsedData.business_info.rush_orders || parsedData.business_info.rush_order_capability || false,
        twenty_four_seven_production: parsedData.business_info.twentyfour_seven || parsedData.business_info.twenty_four_seven_production || false,
        engineering_support_hours: parsedData.business_info.engineering_support_hours || undefined,
        sales_territory: parsedData.business_info.sales_territory || undefined,
        notable_customers: parsedData.notable_customers || undefined,
        awards_recognition: parsedData.awards || undefined,
      } : {},
    }

    // ============================================================================
    // VALIDATION LOGGING - Check what AI actually returned
    // ============================================================================
    console.log('\n=== AI RESEARCH DATA VALIDATION ===')
    
    // Check facilities
    console.log(`Facilities: ${companyData.facilities?.length || 0} found`)
    if (!companyData.facilities || companyData.facilities.length === 0) {
      console.warn('⚠️ WARNING: AI returned no facilities data')
    }
    
    // Check capabilities
    const capabilitiesCount = companyData.capabilities 
      ? Object.values(companyData.capabilities).filter(v => v === true).length 
      : 0
    console.log(`Capabilities: ${capabilitiesCount} enabled`)
    if (capabilitiesCount === 0) {
      console.warn('⚠️ WARNING: AI returned no enabled capabilities')
    }
    
    // Check industries
    console.log(`Industries: ${companyData.industries?.length || 0} found`)
    if (!companyData.industries || companyData.industries.length === 0) {
      console.warn('⚠️ WARNING: AI returned no industries data')
    }
    
    // Check certifications
    console.log(`Certifications: ${companyData.certifications?.length || 0} found`)
    if (!companyData.certifications || companyData.certifications.length === 0) {
      console.warn('⚠️ WARNING: AI returned no certifications data')
    }
    
    // Check technical specs
    const techSpecsCount = companyData.technical_specs
      ? Object.values(companyData.technical_specs).filter(v => v !== null && v !== undefined && v !== false).length
      : 0
    console.log(`Technical Specs: ${techSpecsCount} fields filled`)
    if (techSpecsCount === 0) {
      console.warn('⚠️ WARNING: AI returned no technical specs data')
    }
    
    // Check business info
    const businessInfoCount = companyData.business_info
      ? Object.values(companyData.business_info).filter(v => v !== null && v !== undefined && v !== false).length
      : 0
    console.log(`Business Info: ${businessInfoCount} fields filled`)
    if (businessInfoCount === 0) {
      console.warn('⚠️ WARNING: AI returned no business info data')
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