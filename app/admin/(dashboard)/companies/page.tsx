import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CompanyTable from '@/components/admin/CompanyTable'

interface SearchParams {
  search?: string
  status?: string
  verified?: string
  state?: string
  page?: string
  [key: string]: string | undefined 
}

export default async function AllCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = createServerComponentClient({ cookies })
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
  const { data: companies, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (error) {
    console.error('Error fetching companies:', error)
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and edit company profiles
          </p>
        </div>
      </div>

      <CompanyTable
        companies={companies || []}
        totalPages={totalPages}
        currentPage={page}
        searchParams={params}
      />
    </div>
  )
}