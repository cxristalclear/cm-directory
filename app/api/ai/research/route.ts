import { NextRequest, NextResponse } from 'next/server'
import { researchCompany } from '@/lib/ai/researchCompany'
<<<<<<< HEAD

export async function POST(request: NextRequest) {
  try {
=======
import { createClient } from '@/lib/supabase-server'

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

    // Optional: Log who is making the request (for audit trail)
    console.log(`AI research requested by user: ${user.email}`)

    // Parse request body
>>>>>>> 12f2bb7 (temp: bring in local work)
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

<<<<<<< HEAD
=======
    // Proceed with research (now that user is authenticated)
>>>>>>> 12f2bb7 (temp: bring in local work)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 12f2bb7 (temp: bring in local work)
