import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Building2, Plus, Eye } from 'lucide-react'

// Type for the query results with explicit fields
type CompanyDashboardItem = {
  id: string
  company_name: string
  slug: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get total companies count
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  // Get recently added companies with explicit type casting
  const { data: recentlyAddedRaw } = await supabase
    .from('companies')
    .select('id, company_name, slug, created_at, is_active')
    .order('created_at', { ascending: false })
    .limit(5)

  // Cast to proper type to fix TypeScript inference
  const recentlyAdded = (recentlyAddedRaw || []) as CompanyDashboardItem[]

  // Get recently edited companies with explicit type casting
  const { data: recentlyEditedRaw } = await supabase
    .from('companies')
    .select('id, company_name, slug, updated_at, is_active')
    .order('updated_at', { ascending: false })
    .limit(5)

  // Cast to proper type to fix TypeScript inference  
  const recentlyEdited = (recentlyEditedRaw || []) as CompanyDashboardItem[]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your PCBA Finder companies
        </p>
      </div>

      {/* Stats */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="admin-stat-card">
            <div className="flex items-center gap-4">
              <div className="admin-stat-icon">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <dt className="text-lg font-medium text-gray-900">Total Companies</dt>
                <dd className="text-3xl font-bold">{totalCompanies || 0}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/companies/add"
            className="admin-btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Link>
          <Link
            href="/admin/companies"
            className="admin-btn-secondary inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View All Companies
          </Link>
        </div>
      </div>

      {/* Recently added */}
      <div className="glass-card">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-medium text-gray-900">Recently Added</h2>
        </div>
        <div className="p-6 pt-4">
          {recentlyAdded && recentlyAdded.length > 0 ? (
            <div className="space-y-4">
              {recentlyAdded.map((company) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/companies/edit/${company.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-800"
                    >
                      {company.company_name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(company.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`admin-badge ${
                      company.is_active ? 'admin-badge-success' : 'admin-badge-warning'
                    }`}
                  >
                    {company.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No companies added yet</div>
          )}
        </div>
      </div>

      {/* Recently edited */}
      <div className="glass-card">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-medium text-gray-900">Recently Edited</h2>
        </div>
        <div className="p-6 pt-4">
          {recentlyEdited && recentlyEdited.length > 0 ? (
            <div className="space-y-4">
              {recentlyEdited.map((company) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/companies/edit/${company.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-800"
                    >
                      {company.company_name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(company.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`admin-badge ${
                      company.is_active ? 'admin-badge-success' : 'admin-badge-warning'
                    }`}
                  >
                    {company.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No companies edited yet</div>
          )}
        </div>
      </div>
    </div>
  )
}