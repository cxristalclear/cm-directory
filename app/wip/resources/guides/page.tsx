import Script from "next/script"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

const pageUrl = getCanonicalUrl("/resources/guides")

export const metadata: Metadata = {
  title: "Guides | Contract Manufacturer Directory",
  description: "Guides to evaluate, onboard, and collaborate with electronics contract manufacturers.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Guides | Contract Manufacturer Directory",
    description: "Practical guides for sourcing, auditing, and scaling with electronics manufacturers.",
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Guides for Electronics Manufacturing Teams",
    description: "Best practices for selecting and partnering with contract manufacturers.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const guideEntries = [
  {
    slug: "vendor-qualification-framework",
    title: "Vendor qualification framework",
    summary: "A structured approach for evaluating electronics contract manufacturers before onboarding.",
  },
  {
    slug: "first-article-review-checklist",
    title: "First article review guide",
    summary: "Steps for coordinating engineering, quality, and production teams during first article builds.",
  },
  {
    slug: "supply-chain-escalation-playbook",
    title: "Supply chain escalation playbook",
    summary: "How to collaborate with manufacturing partners when schedules or quality metrics drift.",
  },
]

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Guides</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Guides for sourcing leaders</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Frameworks and playbooks to evaluate technical fit, compliance readiness, and production capacity with your
            manufacturing partners.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Resources", url: getCanonicalUrl("/resources") },
              { name: "Guides", url: pageUrl },
            ]}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {guideEntries.map((guide) => (
            <Link
              key={guide.slug}
              href={`/resources/guides/${guide.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-600">Guide</p>
                <h2 className="mt-3 text-2xl font-semibold text-gray-900">{guide.title}</h2>
                <p className="mt-3 text-sm text-gray-600">{guide.summary}</p>
              </div>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:text-blue-700">
                Read guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          ))}
        </section>
      </main>

      <Script
        id="guides-websiteschema"
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
        id="guides-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Electronics Manufacturing Guides",
            description: metadata.description,
            url: pageUrl,
          }),
        }}
      />
    </div>
  )
}
