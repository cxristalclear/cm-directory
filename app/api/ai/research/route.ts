import { NextRequest, NextResponse } from 'next/server'
import { researchCompany } from '@/lib/ai/researchCompany'
import { createClient } from '@/lib/supabase-server'
import { checkRateLimit, getRateLimitKey } from '@/lib/utils/rate-limit'
import { validateSearchQuery } from '@/lib/utils/validation'
import { parseJsonWithSizeLimit, REQUEST_SIZE_LIMITS } from '@/lib/utils/request-limits'

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in to use AI research' },
        { status: 401 }
      )
    }

    // Rate limiting: 10 requests per minute per user (AI research is expensive)
    const rateLimitKey = getRateLimitKey(request, user.id)
    const rateLimitResult = checkRateLimit(rateLimitKey, {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      identifier: user.id,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error || 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    // Parse request body with size limit (1MB for JSON)
    const parseResult = await parseJsonWithSizeLimit(request, REQUEST_SIZE_LIMITS.JSON)
    
    if (parseResult.error) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 413 } // 413 Payload Too Large
      )
    }

    const body = parseResult.data as Record<string, unknown> | null

    if (!body || typeof body.companyName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'companyName is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize company name
    const rawCompanyName = body.companyName.trim()
    
    // Check for empty company name first (before validation)
    if (!rawCompanyName) {
      return NextResponse.json(
        { success: false, error: 'companyName is required' },
        { status: 400 }
      )
    }
    
    const nameValidation = validateSearchQuery(rawCompanyName, 1, 200)
    
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error || 'Invalid company name' },
        { status: 400 }
      )
    }

    const companyName = nameValidation.sanitized

    // Validate and sanitize website if provided
    let website: string | undefined
    if (typeof body.website === 'string' && body.website.trim()) {
      const websiteValidation = validateSearchQuery(body.website.trim(), 0, 500)
      if (websiteValidation.valid) {
        website = websiteValidation.sanitized
      }
      // If invalid, just ignore the website parameter rather than failing
    }

    // Proceed with research (now that user is authenticated)
    const result = await researchCompany(companyName, website)

    return NextResponse.json(result, {
      status: result.success ? 200 : 422,
    })
  } catch (error) {
    console.error('AI research API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
