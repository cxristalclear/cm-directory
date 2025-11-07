import 'server-only'
import { normalizeWebsiteUrl } from '@/lib/admin/utils'

/**
 * ZoomInfo Enrichment via Make.com Webhook
 * Calls the Make.com webhook to enrich company data from ZoomInfo
 */

export interface ZoomInfoEnrichmentRequest {
  action: string
  company_name: string
  company_website?: string
  website?: string
  location?: {
    city?: string
    state?: string
  }
}

// Raw ZoomInfo response structure from Make.com
export interface ZoomInfoRawData {
  id?: number
  name?: string
  company_name?: string
  website?: string
  domainList?: string[]
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
  foundedYear?: string | number | null
  industries?: string[]
  primaryIndustry?: string[]
  primaryIndustryCode?: Array<{ id?: string; name?: string }>
  primarySubIndustryCode?: Array<{ id?: string; name?: string }>
  industryCodes?: Array<{ id?: string; name?: string }>
  description?: string
  descriptionList?: Array<{ description?: string }>
  certificationDate?: string
  certified?: boolean
  products?: string[]
  logo?: string
  sicCodes?: Array<{ id?: string; name?: string }>
  naicsCodes?: Array<{ id?: string; name?: string }>
  businessModel?: string[]
  competitors?: Array<{
    rank?: number
    id?: number
    name?: string
    website?: string
    employeeCount?: number
  }>
  employeeCountByDepartment?: Record<string, number>
  departmentBudgets?: Record<string, number>
  locationCount?: number
  employeeGrowth?: {
    oneYearGrowthRate?: string
    twoYearGrowthRate?: string
    employeeGrowthDataPoints?: Array<unknown>
  }
  numberOfContactsInZoomInfo?: number
  success?: boolean
  [key: string]: unknown
}

export interface ZoomInfoEnrichmentResponse {
  success: boolean
  data?: unknown
  error?: string
}

function getWebhookUrl(): string {
  const webhookUrl = process.env.ZOOMINFO_WEBHOOK_URL
  if (!webhookUrl) {
    throw new Error('ZOOMINFO_WEBHOOK_URL environment variable is not set')
  }
  return webhookUrl
}

/**
 * Enrich company data using ZoomInfo via Make.com webhook
 */
export async function enrichCompanyData(
  companyName: string,
  website?: string
): Promise<ZoomInfoEnrichmentResponse> {
  const webhookUrl = getWebhookUrl()

  console.log('ZoomInfo Enrichment Request:', {
    companyName,
    website,
    webhookConfigured: Boolean(webhookUrl),
  })

  try {
    const requestBody: ZoomInfoEnrichmentRequest = {
      action: 'enrich_company',
      company_name: companyName,
    }

    const normalizedWebsite = website?.trim() || ''
    if (normalizedWebsite) {
      const formattedWebsite = normalizeWebsiteUrl(normalizedWebsite) || normalizedWebsite
      requestBody.company_website = formattedWebsite
    }

    console.log('Sending to webhook:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Webhook response status:', response.status, response.statusText)

    if (!response.ok) {
      console.error('ZoomInfo webhook error:', response.status, response.statusText)
      return {
        success: false,
        error: `Webhook returned ${response.status}: ${response.statusText}`,
      }
    }

    const responseData = await response.json()
    console.log('ZoomInfo raw response:', JSON.stringify(responseData, null, 2))

    let normalizedResponse: ZoomInfoEnrichmentResponse

    if (isPlainObject(responseData) && 'success' in responseData) {
      const typedResponse = responseData as {
        success: unknown
        data?: unknown
        error?: string
      }

      if (!typedResponse.success) {
        normalizedResponse = {
          success: false,
          error:
            typeof typedResponse.error === 'string'
              ? typedResponse.error
              : 'ZoomInfo enrichment returned no data',
        }
      } else if ('data' in typedResponse && typedResponse.data !== undefined) {
        normalizedResponse = {
          success: true,
          data: typedResponse.data,
        }
      } else {
        normalizedResponse = {
          success: true,
          data: responseData,
        }
        console.log(
          'Wrapped response data (no data property provided):',
          JSON.stringify(normalizedResponse, null, 2)
        )
      }
    } else if (responseData === null || responseData === undefined) {
      normalizedResponse = {
        success: false,
        error: 'Unexpected empty response',
      }
    } else {
      normalizedResponse = {
        success: true,
        data: responseData,
      }
      console.log('Wrapped response data:', JSON.stringify(normalizedResponse, null, 2))
    }

    return normalizedResponse
  } catch (error) {
    console.error('Error calling ZoomInfo enrichment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractZoomInfoRecords(data: unknown): ZoomInfoRawData[] {
  if (!data) {
    return []
  }

  if (Array.isArray(data)) {
    return data.filter(isPlainObject).map(item => item as ZoomInfoRawData)
  }

  if (isPlainObject(data) && 'data' in data) {
    return extractZoomInfoRecords((data as { data?: unknown }).data)
  }

  if (isPlainObject(data)) {
    return [data as ZoomInfoRawData]
  }

  return []
}

function formatKeyValueSummary(values?: Record<string, number>): string | undefined {
  if (!values) {
    return undefined
  }

  const formattedEntries = Object.entries(values)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value !== 0)
    .map(([key, value]) => `${key}: ${value}`)

  if (formattedEntries.length === 0) {
    return undefined
  }

  return formattedEntries.join(', ')
}

function formatCodeList(
  codes?: Array<{ id?: string; name?: string }>
): string | undefined {
  if (!codes) {
    return undefined
  }

  const names = codes
    .map(code => code?.name?.trim())
    .filter((name): name is string => Boolean(name))

  if (names.length === 0) {
    return undefined
  }

  return names.join(', ')
}

function formatCompetitorsList(
  competitors?: ZoomInfoRawData['competitors']
): string | undefined {
  if (!competitors || competitors.length === 0) {
    return undefined
  }

  const competitorDetails = competitors
    .slice(0, 5)
    .map(competitor => {
      if (!competitor || typeof competitor !== 'object') {
        return undefined
      }

      const competitorName = competitor.name?.trim()
      if (!competitorName) {
        return undefined
      }

      const competitorWebsite = competitor.website?.trim()
      const competitorEmployees =
        typeof competitor.employeeCount === 'number' && competitor.employeeCount > 0
          ? `employees: ${competitor.employeeCount}`
          : undefined

      const competitorParts = [
        competitorName,
        competitorWebsite ? `website: ${competitorWebsite}` : undefined,
        competitorEmployees,
      ].filter(Boolean)

      return competitorParts.join(' | ')
    })
    .filter((entry): entry is string => Boolean(entry))

  if (competitorDetails.length === 0) {
    return undefined
  }

  return competitorDetails.join('; ')
}

function resolveDescription(record: ZoomInfoRawData): string | undefined {
  if (typeof record.description === 'string' && record.description.trim()) {
    return record.description.trim()
  }

  if (Array.isArray(record.descriptionList)) {
    for (const entry of record.descriptionList) {
      if (entry && typeof entry.description === 'string' && entry.description.trim()) {
        return entry.description.trim()
      }
    }
  }

  return undefined
}

function truncateText(value: string, maxLength = 500): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3)}...`
}

/**
 * Format ZoomInfo data for display
 */
export function formatEnrichmentData(response: ZoomInfoEnrichmentResponse): string {
  if (!response.success) {
    return 'No enrichment data available'
  }

  const records = extractZoomInfoRecords(response.data)
  if (records.length === 0) {
    return 'No enrichment data available'
  }

  const primaryRecord = records[0]
  const lines: string[] = []
  const numberFormatter = new Intl.NumberFormat('en-US')

  const companyName = primaryRecord.company_name ?? primaryRecord.name
  if (companyName) {
    lines.push(`Company: ${companyName}`)
  }

  const website = primaryRecord.website ?? primaryRecord.domainList?.[0]
  if (website) {
    lines.push(`Website: ${website}`)
  }

  if (primaryRecord.phone) {
    lines.push(`Phone: ${primaryRecord.phone}`)
  }

  if (primaryRecord.fax) {
    lines.push(`Fax: ${primaryRecord.fax}`)
  }

  const headquartersParts = [
    primaryRecord.street,
    primaryRecord.city,
    primaryRecord.state,
    primaryRecord.zipCode,
    primaryRecord.country,
  ].filter((part): part is string => Boolean(part))

  if (headquartersParts.length > 0) {
    lines.push(`Headquarters: ${headquartersParts.join(', ')}`)
  }

  const employeeSummary =
    primaryRecord.employeeRange ??
    (typeof primaryRecord.employeeCount === 'number' && Number.isFinite(primaryRecord.employeeCount)
      ? numberFormatter.format(primaryRecord.employeeCount)
      : undefined)

  if (employeeSummary) {
    lines.push(`Employees: ${employeeSummary}`)
  }

  const employeesByDepartment = formatKeyValueSummary(primaryRecord.employeeCountByDepartment)
  if (employeesByDepartment) {
    lines.push(`Employees by Department: ${employeesByDepartment}`)
  }

  const revenueSummary =
    primaryRecord.revenueRange ??
    (typeof primaryRecord.revenue === 'number' && Number.isFinite(primaryRecord.revenue)
      ? `$${numberFormatter.format(primaryRecord.revenue)}`
      : undefined)

  if (revenueSummary) {
    lines.push(`Revenue: ${revenueSummary}`)
  }

  const foundedYear =
    typeof primaryRecord.foundedYear === 'number' || typeof primaryRecord.foundedYear === 'string'
      ? String(primaryRecord.foundedYear)
      : undefined

  if (foundedYear) {
    lines.push(`Founded: ${foundedYear}`)
  }

  const industries = primaryRecord.industries ?? primaryRecord.primaryIndustry
  if (industries && industries.length > 0) {
    lines.push(`Industries: ${industries.join(', ')}`)
  }

  const sicCodes = formatCodeList(primaryRecord.sicCodes)
  if (sicCodes) {
    lines.push(`SIC Codes: ${sicCodes}`)
  }

  const naicsCodes = formatCodeList(primaryRecord.naicsCodes)
  if (naicsCodes) {
    lines.push(`NAICS Codes: ${naicsCodes}`)
  }

  if (primaryRecord.products && primaryRecord.products.length > 0) {
    lines.push(`Products: ${primaryRecord.products.join(', ')}`)
  }

  if (primaryRecord.businessModel && primaryRecord.businessModel.length > 0) {
    lines.push(`Business Model: ${primaryRecord.businessModel.join(', ')}`)
  }

  const description = resolveDescription(primaryRecord)
  if (description) {
    lines.push(`Description: ${truncateText(description)}`)
  }

  const competitorSummary = formatCompetitorsList(primaryRecord.competitors)
  if (competitorSummary) {
    lines.push(`Competitors: ${competitorSummary}`)
  }

  const budgetSummary = formatKeyValueSummary(primaryRecord.departmentBudgets)
  if (budgetSummary) {
    lines.push(`Department Budgets: ${budgetSummary}`)
  }

  if (primaryRecord.employeeGrowth?.oneYearGrowthRate || primaryRecord.employeeGrowth?.twoYearGrowthRate) {
    const growthParts: string[] = []
    if (primaryRecord.employeeGrowth?.oneYearGrowthRate) {
      growthParts.push(`One Year: ${primaryRecord.employeeGrowth.oneYearGrowthRate}`)
    }
    if (primaryRecord.employeeGrowth?.twoYearGrowthRate) {
      growthParts.push(`Two Year: ${primaryRecord.employeeGrowth.twoYearGrowthRate}`)
    }
    if (growthParts.length > 0) {
      lines.push(`Employee Growth: ${growthParts.join(', ')}`)
    }
  }

  if (
    typeof primaryRecord.numberOfContactsInZoomInfo === 'number' &&
    Number.isFinite(primaryRecord.numberOfContactsInZoomInfo)
  ) {
    lines.push(`Contacts in ZoomInfo: ${primaryRecord.numberOfContactsInZoomInfo}`)
  }

  if (records.length > 1) {
    lines.push(`Additional matches: ${records.length - 1} more record(s) available`)
  }

  lines.push('Raw ZoomInfo Record:')
  lines.push(JSON.stringify(primaryRecord, null, 2))

  return lines.join('\n')
}
