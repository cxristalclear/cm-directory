import Script from "next/script"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import Navbar from "@/components/navbar"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

const pageUrl = getCanonicalUrl("/resources")

export const metadata: Metadata = {
  title: "Resources | Contract Manufacturer Directory",
  description: "Guides and checklists to help engineering and sourcing teams qualify electronics contract manufacturers.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Resources | Contract Manufacturer Directory",
    description: "Explore guides and checklists for selecting the right manufacturing partners.",
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Resources for Electronics Sourcing Teams",
    description: "Practical resources for vetting and collaborating with manufacturing partners.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const resourceCards = [
  {
    title: "Guides",
    description: "Deep dives on selecting, onboarding, and scaling with electronics manufacturing partners.",
    href: "/resources/guides",
  },
  {
    title: "Checklists",
    description: "Step-by-step checklists for factory audits, readiness reviews, and compliance assessments.",
    href: "/resources/checklists",
  },
]

export default function ResourcesHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Resource Hub</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Resources for sourcing teams</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Practical frameworks, checklists, and guides built for engineering, operations, and supply chain leaders evaluating
            contract manufacturers.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Resources", url: pageUrl },
            ]}
          />
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {resourceCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-600">Toolkit</p>
                <h2 className="mt-3 text-2xl font-semibold text-gray-900">{card.title}</h2>
                <p className="mt-3 text-sm text-gray-600">{card.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:text-blue-700">
                Explore {card.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          ))}
        </section>
      </main>

      <Script
        id="resources-websiteschema"
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
        id="resources-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Contract Manufacturer Resources",
            description: metadata.description,
            url: pageUrl,
          }),
        }}
      />
    </div>
  )
}
