import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function CompanyResearchHistoryPage({
  params,
}: {
  params: { identifier: string };
}) {
  const supabase = await createClient();
  const { identifier } = params;

  // Try slug first, then fall back to id lookup to avoid SQL injection from template interpolation
  let company = null;
  let error = null;

  const { data: bySlug, error: slugError } = await supabase
    .from("companies")
    .select("id, company_name, slug, website_url")
    .eq("slug", identifier)
    .maybeSingle();

  if (bySlug) {
    company = bySlug;
  } else if (!slugError || slugError.code === "PGRST116") {
    const { data: byId, error: idError } = await supabase
      .from("companies")
      .select("id, company_name, slug, website_url")
      .eq("id", identifier)
      .maybeSingle();

    company = byId;
    error = idError;
  } else {
    error = slugError;
  }

  if (error) {
    console.error("Error fetching company:", error);
  }
  if (!company) {
    notFound();
  }

  const { data: history, error: historyError } = await supabase
    .from("company_research_history")
    .select(
      "id, research_summary, research_notes, research_snapshot, enrichment_snapshot, created_at, created_by_name, created_by_email, data_confidence"
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (historyError) {
    console.error("Failed to load company research history:", historyError);
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h1 className="text-3xl font-semibold gradient-text">Research History</h1>
          <p className="mt-2 text-sm text-red-600">
            Unable to load research history. Please try again later.
          </p>
          <Link href="/admin/companies/research/history" className="admin-btn-secondary mt-4 inline-flex">
            ← Back to research history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold gradient-text">{company.company_name}</h1>
          {company.website_url && (
            <a
              href={company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 break-all"
            >
              {company.website_url}
            </a>
          )}
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {history?.length ? `${history.length} saved research snapshot${history.length === 1 ? "" : "s"}.` : "No research history saved yet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/companies/research/history" className="admin-btn-secondary">
            ← All research history
          </Link>
          {company.slug && (
            <Link href={`/admin/companies/edit/${company.slug}`} className="admin-btn-primary">
              Edit Company
            </Link>
          )}
        </div>
      </div>

      {!history?.length ? (
        <div className="glass-card p-6 text-sm text-gray-600">
          No research history exists for this company.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => {
            const formattedDate = entry.created_at
              ? new Date(entry.created_at).toLocaleString()
              : "Unknown";
            const createdBy = entry.created_by_name || entry.created_by_email || "Unknown";

            return (
              <div key={entry.id} className="glass-card p-5 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Snapshot saved</p>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>By {createdBy}</p>
                    {entry.data_confidence && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 mt-1">
                        Confidence: {entry.data_confidence}
                      </span>
                    )}
                  </div>
                </div>

                {entry.research_summary && (
                  <p className="text-sm text-gray-800">{entry.research_summary}</p>
                )}

                {entry.research_notes && (
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Notes: </span>
                    {entry.research_notes}
                  </div>
                )}

                <details className="group rounded-md border border-dashed border-gray-200 bg-gray-50/60 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800">
                    View full research snapshot
                  </summary>
                  <pre className="mt-3 max-h-96 overflow-auto rounded bg-white p-3 text-xs leading-relaxed text-gray-800">
                    {JSON.stringify(entry.research_snapshot, null, 2)}
                  </pre>
                </details>

                {entry.enrichment_snapshot && (
                  <details className="group rounded-md border border-dashed border-gray-200 bg-gray-50/60 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-800">
                      View enrichment data
                    </summary>
                    <pre className="mt-3 max-h-96 overflow-auto rounded bg-white p-3 text-xs leading-relaxed text-gray-800">
                      {JSON.stringify(entry.enrichment_snapshot, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
