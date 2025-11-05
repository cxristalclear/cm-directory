import { NextRequest, NextResponse } from 'next/server'
import { researchCompany } from '@/lib/ai/researchCompany'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body.companyName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'companyName is required' },
        { status: 400 }
      )
    }

    const companyName = body.companyName.trim()
    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'companyName is required' },
        { status: 400 }
      )
    }

    const website =
      typeof body.website === 'string' && body.website.trim()
        ? body.website.trim()
        : undefined

    const result = await researchCompany(companyName, website)

    return NextResponse.json(result, {
      status: result.success ? 200 : 502,
    })
  } catch (error) {
    console.error('AI research API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
