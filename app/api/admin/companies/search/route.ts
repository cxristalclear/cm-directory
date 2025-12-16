import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { validateSearchQuery } from '@/lib/utils/validation'
import { checkRateLimit, getRateLimitKey } from '@/lib/utils/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ companies: [], error: 'Unauthorized' }, { status: 401 })
    }

    const userMetadata = user.user_metadata as Record<string, unknown> | null
    const appMetadata = user.app_metadata as Record<string, unknown> | null
    const metadataRole =
      typeof userMetadata?.role === 'string'
        ? userMetadata.role
        : typeof appMetadata?.role === 'string'
        ? appMetadata.role
        : undefined
    const role = metadataRole ?? user.role

    if (role !== 'admin') {
      return NextResponse.json({ companies: [], error: 'Forbidden' }, { status: 403 })
    }

    // Rate limiting: 30 requests per minute per user
    const rateLimitKey = getRateLimitKey(request, user.id)
    const rateLimitResult = checkRateLimit(rateLimitKey, {
      maxRequests: 30,
      windowMs: 60 * 1000, // 1 minute
      identifier: user.id,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { companies: [], error: rateLimitResult.error || 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const rawQuery = new URL(request.url).searchParams.get('q')?.trim() || ''
    const queryValidation = validateSearchQuery(rawQuery, 2, 200) // Min 2 chars for search, max 200

    if (!queryValidation.valid) {
      return NextResponse.json(
        { companies: [], error: queryValidation.error || 'Invalid search query' },
        { status: 400 }
      )
    }

    const query = queryValidation.sanitized

    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, slug, website_url')
      .ilike('company_name', `%${query}%`)
      .order('company_name', { ascending: true })
      .limit(8)

    if (error) {
      console.error('Company search query failed', error)
      return NextResponse.json({ companies: [], error: 'Unable to search companies' }, { status: 500 })
    }

    return NextResponse.json({ companies: data ?? [] })
  } catch (error) {
    console.error('Company search API error', error)
    return NextResponse.json({ companies: [], error: 'Internal server error' }, { status: 500 })
  }
}
