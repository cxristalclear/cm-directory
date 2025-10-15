/**
 * ZoomInfo Enrichment via Make.com Webhook
 * Calls the Make.com webhook to enrich company data from ZoomInfo
 */

export interface ZoomInfoEnrichmentRequest {
  action: string
  company_name: string
  website?: string
  location?: {
    city?: string
    state?: string
  }
}

// Raw ZoomInfo response structure from Make.com
export interface ZoomInfoRawData {
  id: number
  name: string
  website: string
  phone?: string
  fax?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  employeeCount?: number
  employeeRange?: string
  revenue?: number
  revenueRange?: string
  foundedYear?: string
  industries?: string[]
  descriptionList?: Array<{ description: string }>
  certificationDate?: string
  certified?: boolean
  products?: string[]
  logo?: string
}

export interface ZoomInfoEnrichmentResponse {
  success: boolean
  data?: {
    company_name?: string
    website?: string
    employee_count?: number
    employee_range?: string
    revenue?: number
    revenue_range?: string
    year_founded?: number
    industry?: string
    description?: string
    headquarters?: {
      street?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
    phone?: string
    certifications?: string[]
    technologies?: string[]
  }
  error?: string
}

const WEBHOOK_URL = 'https://hook.us1.make.celonis.com/obav4qf8bnmsmf19xfpsr62bjsx2qy6t'

/**
 * Enrich company data using ZoomInfo via Make.com webhook
 */
export async function enrichCompanyData(
  companyName: string,
  website?: string
): Promise<ZoomInfoEnrichmentResponse> {
  console.log('🔍 ZoomInfo Enrichment Request:', {
    companyName,
    website,
    webhookUrl: WEBHOOK_URL
  })

  try {
    const requestBody: ZoomInfoEnrichmentRequest = {
      action: 'enrich_company',
      company_name: companyName,
    }

    if (website) {
      requestBody.website = website
    }

    console.log('📤 Sending to webhook:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📥 Webhook response status:', response.status, response.statusText)

    if (!response.ok) {
      console.error('❌ ZoomInfo webhook error:', response.status, response.statusText)
      return {
        success: false,
        error: `Webhook returned ${response.status}: ${response.statusText}`,
      }
    }

    const responseData = await response.json()
    console.log('✅ ZoomInfo raw response:', JSON.stringify(responseData, null, 2))
    
    // Handle different possible response formats
    let data: ZoomInfoEnrichmentResponse
    
    // Check if response has the expected structure
    if (responseData && typeof responseData === 'object') {
      // If it already has success field, use it as-is
      if ('success' in responseData) {
        data = responseData as ZoomInfoEnrichmentResponse
      } 
      // If it's just the data without a wrapper, wrap it
      else {
        data = {
          success: true,
          data: responseData
        }
        console.log('📦 Wrapped response data:', JSON.stringify(data, null, 2))
      }
    } else {
      data = {
        success: false,
        error: 'Unexpected response format'
      }
    }
    
    return data
  } catch (error) {
    console.error('❌ Error calling ZoomInfo enrichment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Format ZoomInfo data for display
 */
export function formatEnrichmentData(response: ZoomInfoEnrichmentResponse): string {
  if (!response.success || !response.data) {
    return 'No enrichment data available'
  }

  const data = response.data
  const parts: string[] = []

  if (data.company_name) parts.push(`Company: ${data.company_name}`)
  if (data.website) parts.push(`Website: ${data.website}`)
  if (data.employee_range) parts.push(`Employees: ${data.employee_range}`)
  if (data.revenue_range) parts.push(`Revenue: ${data.revenue_range}`)
  if (data.year_founded) parts.push(`Founded: ${data.year_founded}`)
  if (data.industry) parts.push(`Industry: ${data.industry}`)
  if (data.description) parts.push(`Description: ${data.description}`)
  
  if (data.headquarters) {
    const hq = data.headquarters
    const location = [hq.city, hq.state, hq.country].filter(Boolean).join(', ')
    if (location) parts.push(`HQ: ${location}`)
  }

  return parts.join('\n')
}