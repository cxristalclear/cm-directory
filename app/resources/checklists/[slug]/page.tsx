import Script from "next/script"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

type ChecklistPageProps = {
  params: Promise<{ slug: string }>
}

const checklistSummaryBySlug: Record<string, string> = {
  "factory-readiness-checklist":
    "Verify that production lines, documentation, and quality controls are ready for your build.",
  "compliance-audit-checklist":
    "Confirm certifications, traceability, and record-keeping meet regulatory expectations.",
  "new-product-launch-checklist":
    "Coordinate cross-functional milestones to ensure first builds stay on schedule.",
}

function formatChecklistTitle(slug: string): string {
  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

export async function generateMetadata({ params }: ChecklistPageProps): Promise<Metadata> {
  const { slug } = await params
  const checklistTitle = formatChecklistTitle(slug)
  const summary =
    checklistSummaryBySlug[slug] ?? "Checklist to align engineering, quality, and supply chain teams with manufacturing partners."
  const canonicalUrl = getCanonicalUrl(`/resources/checklists/${slug}`)

  return {
    title: `${checklistTitle} | CM Directory Checklists`,
    description: summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${checklistTitle} | CM Directory Checklists`,
      description: summary,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: checklistTitle,
      description: summary,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const { slug } = await params
  const checklistTitle = formatChecklistTitle(slug)
  const summary =
    checklistSummaryBySlug[slug] ?? "Checklist to align engineering, quality, and supply chain teams with manufacturing partners."
  const canonicalUrl = getCanonicalUrl(`/resources/checklists/${slug}`)

  const placeholderItems = [
    "Confirm scope, timelines, and responsible owners.",
    "Collect documentation from the manufacturing partner.",
    "Schedule on-site or virtual walkthroughs.",
    "Document findings and assign follow-up actions.",
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Checklist</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{checklistTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-blue-100">{summary}</p>
          <p className="mt-3 text-sm text-blue-200">Download, print, or duplicate this checklist for your next review.</p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Resources", url: getCanonicalUrl("/resources") },
              { name: "Checklists", url: getCanonicalUrl("/resources/checklists") },
              { name: checklistTitle, url: canonicalUrl },
            ]}
          />
        </section>

        <article className="mt-8 space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Checklist overview</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Print this checklist or duplicate it into your project workspace. Each item includes space to capture findings and
                  next actions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-400"
                >
                  Print checklist
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Checklist items</h3>
            <ul className="space-y-3">
              {placeholderItems.map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    aria-label={`Checklist item ${index + 1}`}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            Placeholder zone for notes, attachments, and collaboration tools. Use this area to capture action items and owner
            assignments.
          </section>
        </article>
      </main>

      <Script
        id="checklist-websiteschema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
          }),
        }}
      />

      <Script
        id="checklist-howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: checklistTitle,
            description: summary,
            step: placeholderItems.map((stepDescription, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: `Step ${index + 1}`,
              text: stepDescription,
            })),
          }),
        }}
      />
    </div>
  )
}
