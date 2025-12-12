import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import Navbar from "@/components/navbar"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps } from "@/lib/schema"
import { allIndustries } from "@/lib/industries"

const pageUrl = getCanonicalUrl("/industries")
const siteName = siteConfig.name

export const metadata: Metadata = {
  title: "Industries | Specialized Manufacturing Markets",
  description:
    "Browse specialized manufacturing industries to find contract manufacturers with the right certifications and capabilities.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Industries | Specialized Manufacturing Markets",
    description: `Explore regulated and high-reliability industries served by ${siteName} partners.`,
    url: pageUrl,
    siteName: siteConfig.name,
  },
}

export default function IndustriesIndexPage() {
  const itemListSchema = {
    "@context": "https://schema.org" as const,
    "@type": "ItemList",
    name: "Industries",
    url: pageUrl,
    itemListElement: allIndustries.map((industry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: getCanonicalUrl(`/industries/${industry.slug}`),
      name: industry.title,
      ...(industry.summary ? { description: industry.summary } : {}),
    })),
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="pb-16 pt-12">
        <div className="container mx-auto px-4">
          <script {...jsonLdScriptProps(itemListSchema)} />
          <Breadcrumbs
            className="text-sm text-gray-500"
            items={[
              { name: "Home", url: "/" },
              { name: "Industries", url: pageUrl },
            ]}
          />

          <div className="mt-8 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900">Industries we serve</h1>
            <p className="mt-3 text-lg text-gray-600">
              Build shortlists of contract manufacturers with the certifications, regulatory programs, and process controls required
              for your industry.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {allIndustries.map(industry => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    {industry.name}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-gray-900">{industry.title}</h2>
                  <p className="mt-3 text-sm text-gray-600">{industry.summary}</p>
                </div>
                <span className="mt-6 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:text-blue-700">
                  Explore manufacturers
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
