import { createClient } from '@/lib/supabase-server'
import CompanyTable from '@/components/admin/CompanyTable'

interface SearchParams {
  search?: string
  status?: string
  verified?: string
  state?: string
  page?: string
  [key: string]: string | undefined 
}

// Type that matches EXACTLY what CompanyTable expects
type CompanyTableItem = {
  id: string
  company_name: string
  slug: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  facilities?: Array<{ city?: string; state?: string }>
}

// Type for the raw database result
type DatabaseCompany = {
  id: string
  company_name: string
  slug: string
  is_active: boolean | null
  is_verified: boolean | null
  created_at: string
  updated_at: string
  facilities: Array<{
    city: string | null
    state: string | null
  }> | null
}

export default async function AllCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const page = parseInt(params.page || '1')
  const perPage = 20
  const offset = (page - 1) * perPage

  // Build query
  let query = supabase
    .from('companies')
    .select('id, company_name, slug, is_active, is_verified, created_at, updated_at, facilities(city, state)', {
      count: 'exact',
    })

  // Apply filters
  if (params.search) {
    query = query.ilike('company_name', `%${params.search}%`)
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true)
  } else if (params.status === 'draft') {
    query = query.eq('is_active', false)
  }

  if (params.verified === 'yes') {
    query = query.eq('is_verified', true)
  } else if (params.verified === 'no') {
    query = query.eq('is_verified', false)
  }

  // Execute query with pagination
  const { data: companiesRaw, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (error) {
    console.error('Error fetching companies:', error)
  }

  // Cast and transform the data to match CompanyTable's expected type
  const dbCompanies = (companiesRaw || []) as unknown as DatabaseCompany[]
  
  const companies: CompanyTableItem[] = dbCompanies.map((company) => ({
    id: company.id,
    company_name: company.company_name,
    slug: company.slug,
    is_active: company.is_active ?? false,
    is_verified: company.is_verified ?? false,
    created_at: company.created_at,
    updated_at: company.updated_at,
    facilities: company.facilities 
      ? company.facilities.map((facility) => ({
          city: facility.city ?? undefined,
          state: facility.state_province ?? facility.state ?? undefined,
        }))
      : undefined,
  }))

  const totalPages = count ? Math.ceil(count / perPage) : 0

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">All Companies</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Manage and edit company profiles
            </p>
          </div>
          {/* Action buttons should use the admin-btn-* styles when added */}
        </div>
      </div>

      <CompanyTable
        companies={companies}
        totalPages={totalPages}
        currentPage={page}
        searchParams={params}
      />
    </div>
  )
}
