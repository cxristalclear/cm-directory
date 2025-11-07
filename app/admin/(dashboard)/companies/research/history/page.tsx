import Link from "next/link"
import { createClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

type SearchParams = {
  search?: string
}

type ResearchHistoryRow = Database["public"]["Tables"]["company_research_history"]["Row"] & {
  companies?: {
    slug?: string | null
  } | null
}

export const revalidate = 0

export default async function ResearchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { search = "" } = await searchParams
  const searchTerm = search.trim()

  let query = supabase
    .from("company_research_history")
    .select(
      `
        id,
        company_id,
        company_name,
        website_url,
        research_summary,
        created_at,
        created_by_name,
        created_by_email,
        data_confidence,
        companies:company_id (slug)
      `
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (searchTerm) {
    query = query.or(
      `company_name.ilike.%${searchTerm}%,website_url.ilike.%${searchTerm}%,created_by_email.ilike.%${searchTerm}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to load research history:", error)
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h1 className="text-3xl font-semibold gradient-text">Research History</h1>
          <p className="mt-2 text-sm text-red-600">
            Unable to load research history. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const history = (data ?? []) as ResearchHistoryRow[]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">Research History</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Search AI-generated research snapshots by company, domain, or researcher.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/companies/research" className="admin-btn-secondary">
              ← Back to Research
            </Link>
          </div>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          action="/admin/companies/research/history"
        >
          <input
            type="search"
            name="search"
            defaultValue={searchTerm}
            placeholder="Search by company, website, or researcher…"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          <div className="flex gap-2">
            <button type="submit" className="admin-btn-primary text-sm">
              Search
            </button>
            {searchTerm && (
              <Link href="/admin/companies/research/history" className="admin-btn-secondary text-sm">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-6 text-sm text-gray-600">
          {searchTerm
            ? `No results found for "${searchTerm}". Try a different search term.`
            : "No research history has been saved yet. Run AI research on a company and save it to populate this list."}
        </div>
      ) : (
        <div className="glass-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3 whitespace-nowrap">Saved</th>
                  <th className="px-4 py-3">Researcher</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map(entry => {
                  const companySlug = entry.companies?.slug ?? null
                  const formattedDate = entry.created_at
                    ? new Date(entry.created_at).toLocaleString()
                    : "Unknown"
                  const createdBy = entry.created_by_name || entry.created_by_email || "Unknown"
                  const identifier = companySlug || entry.company_id

                  return (
                    <tr key={entry.id} className="text-gray-900">
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900">{entry.company_name}</span>
                          {companySlug && (
                            <Link
                              href={`/admin/companies/edit/${companySlug}`}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Edit company →
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {entry.website_url ? (
                          <a
                            href={entry.website_url.startsWith("http") ? entry.website_url : `https://${entry.website_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700 break-all"
                          >
                            {entry.website_url}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {entry.research_summary ? (
                          <span className="line-clamp-3">{entry.research_summary}</span>
                        ) : (
                          <span className="text-gray-400">No summary</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-500">
                        {createdBy}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Link
                            href={`/admin/companies/research/history/${identifier}`}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View history
                          </Link>
                          <span className="text-[11px] text-gray-400">ID {entry.id.slice(0, 8)}…</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
