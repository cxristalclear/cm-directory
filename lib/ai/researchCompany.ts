import 'server-only'

/**
 * Main Company Research Logic
 * Orchestrates ZoomInfo enrichment and OpenAI research
 */

import { callOpenAI } from './openaiClient'
import { enrichCompanyData, formatEnrichmentData } from './zoomInfoEnrich'
import type { CompanyFormData } from '@/types/admin'

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
      "state": "string",
      "zip_code": "string",
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

You must only return JSON with proper formatting and escaping and nothing else.`

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

Company Name: ${companyName}
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
