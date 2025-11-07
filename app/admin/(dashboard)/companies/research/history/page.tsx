import Link from "next/link"
import { createClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

type ResearchHistoryRow = Database["public"]["Tables"]["company_research_history"]["Row"] & {
  companies?: {
    slug?: string | null
  } | null
}

export const revalidate = 0

export default async function ResearchHistoryPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("company_research_history")
    .select(
      `
        id,
        company_id,
        company_name,
        website_url,
        research_summary,
        research_notes,
        data_confidence,
        created_at,
        created_by_name,
        created_by_email,
        research_snapshot,
        companies:company_id (slug)
      `
    )
    .order("created_at", { ascending: false })
    .limit(100)

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
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold gradient-text">Research History</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Review the most recent AI-generated research snapshots that were saved to the database.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/companies/research" className="admin-btn-secondary">
              ← Back to Research
            </Link>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-6 text-sm text-gray-600">
          No research history has been saved yet. Run AI research on a company and save it to populate this list.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(entry => {
            const companySlug = entry.companies?.slug ?? null
            const formattedDate = entry.created_at
              ? new Date(entry.created_at).toLocaleString()
              : "Unknown"
            const createdBy = entry.created_by_name || entry.created_by_email || "Unknown"

            return (
              <div key={entry.id} className="glass-card p-5 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {entry.company_name}
                      </h2>
                      {companySlug && (
                        <Link
                          href={`/admin/companies/edit/${companySlug}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit Company →
                        </Link>
                      )}
                    </div>
                    {entry.website_url && (
                      <a
                        href={entry.website_url.startsWith("http") ? entry.website_url : `https://${entry.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 break-all"
                      >
                        {entry.website_url}
                      </a>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{formattedDate}</p>
                    <p>By {createdBy}</p>
                  </div>
                </div>

                {entry.research_summary && (
                  <p className="text-sm text-gray-700">{entry.research_summary}</p>
                )}

                {entry.research_notes && (
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Notes: </span>
                    {entry.research_notes}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {entry.data_confidence && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      Confidence: {entry.data_confidence}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                    Snapshot ID: {entry.id.slice(0, 8)}…
                  </span>
                </div>

                <details className="group rounded-md border border-dashed border-gray-200 bg-gray-50/60 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800">
                    View research snapshot
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto rounded bg-white p-3 text-xs leading-relaxed text-gray-800">
                    {JSON.stringify(entry.research_snapshot, null, 2)}
                  </pre>
                </details>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
