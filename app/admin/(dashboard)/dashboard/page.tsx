import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Building2, Plus, Eye } from 'lucide-react'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get total companies count
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  // Get recently added companies
  const { data: recentlyAdded } = await supabase
    .from('companies')
    .select('id, company_name, slug, created_at, is_active')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recently edited companies
  const { data: recentlyEdited } = await supabase
    .from('companies')
    .select('id, company_name, slug, updated_at, is_active')
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6 ">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your CM directory companies
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="admin-stat-card">
          <div className="flex items-center gap-4">
            <div className="admin-stat-icon">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-gray-600">Total Companies</dt>
              <dd className="text-3xl font-bold gradient-text">{totalCompanies || 0}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-stat-card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/companies/add"
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Link>
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            View All Companies
          </Link>
        </div>
      </div>

      {/* Recently added */}
      <div className="admin-stat-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recently Added</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentlyAdded && recentlyAdded.length > 0 ? (
            recentlyAdded.map((company) => (
              <div key={company.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <Link
                    href={`/admin/companies/edit/${company.slug}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {company.company_name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {company.is_active ? 'Active' : 'Draft'}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No companies added yet
            </div>
          )}
        </div>
      </div>

      {/* Recently edited */}
      <div className="admin-stat-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recently Edited</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentlyEdited && recentlyEdited.length > 0 ? (
            recentlyEdited.map((company) => (
              <div key={company.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <Link
                    href={`/admin/companies/edit/${company.slug}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {company.company_name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(company.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {company.is_active ? 'Active' : 'Draft'}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No companies edited yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}