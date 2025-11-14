import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    const query = new URL(request.url).searchParams.get('q')?.trim()
    if (!query || query.length < 2) {
      return NextResponse.json({ companies: [] })
    }

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
