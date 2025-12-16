import Script from "next/script"
import Link from "next/link"
import type { Metadata } from "next"
import { Download } from "lucide-react"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import Navbar from "@/components/navbar"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

const pageUrl = getCanonicalUrl("/resources/checklists")

export const metadata: Metadata = {
  title: "Checklists | Contract Manufacturer Directory",
  description: "Downloadable checklists for factory audits, readiness reviews, and supplier onboarding.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Checklists | Contract Manufacturer Directory",
    description: "Practical manufacturing readiness and compliance checklists for sourcing teams.",
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
}

const checklistEntries = [
  {
    slug: "factory-readiness-checklist",
    title: "Factory readiness checklist",
    summary: "Evaluate line readiness, quality controls, and documentation before production ramps.",
  },
  {
    slug: "compliance-audit-checklist",
    title: "Compliance audit checklist",
    summary: "Ensure certifications, traceability, and documentation meet industry regulations.",
  },
  {
    slug: "new-product-launch-checklist",
    title: "New product launch checklist",
    summary: "Coordinate engineering, supply chain, and manufacturing for first builds.",
  },
]

export default function ChecklistsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Checklists</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Manufacturing checklists</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Structured checklists that sourcing, operations, and quality leads can use to run consistent reviews with manufacturing
            partners.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Resources", url: getCanonicalUrl("/resources") },
              { name: "Checklists", url: pageUrl },
            ]}
          />
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {checklistEntries.map((checklist) => (
            <Link
              key={checklist.slug}
              href={`/resources/checklists/${checklist.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-600">Checklist</p>
                <h2 className="mt-3 text-2xl font-semibold text-gray-900">{checklist.title}</h2>
                <p className="mt-3 text-sm text-gray-600">{checklist.summary}</p>
              </div>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:text-blue-700">
                Download / Print
                <Download className="ml-2 h-4 w-4" />
              </span>
            </Link>
          ))}
        </section>
      </main>

      <Script
        id="checklists-websiteschema"
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
        id="checklists-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Manufacturing Checklists",
            description: metadata.description,
            url: pageUrl,
          }),
        }}
      />
    </div>
  )
}
