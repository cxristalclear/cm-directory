'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2, History, Search } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'


interface Company {
  id: string
  company_name: string
  slug: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  facilities?: Array<{ city?: string; state?: string }>
}

interface CompanyTableProps {
  companies: Company[]
  totalPages: number
  currentPage: number
  searchParams: Record<string, string | undefined>
}

export default function CompanyTable({
  companies,
  totalPages,
  currentPage,
  searchParams,
}: CompanyTableProps) {
  const router = useRouter()
  const searchParamsObj = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.search || '')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClientComponentClient()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParamsObj.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 on filter change
    router.push(`/admin/companies?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', searchInput)
  }

  const handleDelete = async (companyId: string, companyName: string) => {
    if (deleteConfirm !== companyId) {
      setDeleteConfirm(companyId)
      toast.warning(`Click delete again to confirm deletion of "${companyName}"`)
      return
    }

    setDeleting(true)
    try {
      // Delete related data first
      await supabase.from('facilities').delete().eq('company_id', companyId)
      await supabase.from('capabilities').delete().eq('company_id', companyId)
      await supabase.from('industries').delete().eq('company_id', companyId)
      await supabase.from('certifications').delete().eq('company_id', companyId)
      await supabase.from('technical_specs').delete().eq('company_id', companyId)
      await supabase.from('business_info').delete().eq('company_id', companyId)
      await supabase.from('company_change_log').delete().eq('company_id', companyId)

      // Delete company
      const { error } = await supabase.from('companies').delete().eq('id', companyId)

      if (error) throw error

      toast.success('Company deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Failed to delete company')
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParamsObj.toString())
    params.set('page', page.toString())
    router.push(`/admin/companies?${params.toString()}`)
  }

  return (
    <div className="glass-card admin-table">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search companies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="admin-input w-full pl-10"
            />
          </div>
          <button
            type="submit"
            className="admin-btn-primary"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select
            value={searchParams.status || ''}
            onChange={(e) => updateFilters('status', e.target.value)}
            className="admin-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={searchParams.verified || ''}
            onChange={(e) => updateFilters('verified', e.target.value)}
            className="admin-select"
          >
            <option value="">All Verification</option>
            <option value="yes">Verified</option>
            <option value="no">Not Verified</option>
          </select>

          {(searchParams.search || searchParams.status || searchParams.verified) && (
            <button
              type="button"
              onClick={() => router.push('/admin/companies')}
              className="admin-btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="admin-table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Verified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              companies.map((company) => {
                const primaryFacility = company.facilities?.find(f => f.city && f.state)
                const location = primaryFacility
                  ? `${primaryFacility.city}, ${primaryFacility.state}`
                  : 'N/A'

                return (
                  <tr key={company.id} className="admin-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link
                          href={`/admin/companies/edit/${company.slug}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {company.company_name}
                        </Link>
                        <p className="text-xs text-gray-500">{company.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`admin-badge ${
                          company.is_active
                            ? 'admin-badge-success'
                            : 'admin-badge-warning'
                        }`}
                      >
                        {company.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.is_verified ? (
                        <span className="admin-badge admin-badge-success">Verified</span>
                      ) : (
                        <span className="admin-badge admin-badge-warning">Not Verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/companies/edit/${company.slug}`}
                          className="admin-btn-icon"
                          aria-label={`Edit ${company.company_name}`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/companies/${company.slug}/history`}
                          className="admin-btn-icon"
                          aria-label={`View history for ${company.company_name}`}
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(company.id, company.company_name)}
                          disabled={deleting}
                          className={`admin-btn-icon ${
                            deleteConfirm === company.id ? 'text-red-600' : 'text-gray-500'
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
                          title="Delete"
                          aria-label={`Delete ${company.company_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr className="admin-table-row">
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}