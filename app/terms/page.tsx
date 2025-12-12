import Script from "next/script"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import Navbar from "@/components/navbar"

const pageUrl = getCanonicalUrl("/terms")
const siteName = siteConfig.name

export const metadata: Metadata = {
  title: "Terms of Service | Contract Manufacturer Directory",
  description: "Terms governing the use of the Contract Manufacturer Directory platform and related services.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Terms of Service | Contract Manufacturer Directory",
    description: `Understand the acceptable use policies and legal terms for the ${siteName} platform.`,
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Terms</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            These terms detail the acceptable use policies, responsibilities, and commitments between the {siteName} team and our
            users.
          </p>
          <p className="mt-5 text-sm text-blue-200">Last updated: January 5, 2024</p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Terms", url: pageUrl },
            ]}
          />
        </section>

        <article className="mt-8 space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Use of the platform</h2>
            <p className="text-sm text-gray-700">
              Users agree to use {siteName} for lawful purposes related to discovering and collaborating with contract
              manufacturers. Automated scraping or republishing of content without consent is prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Company submissions</h2>
            <p className="text-sm text-gray-700">
              Manufacturers submitting profiles confirm they have authority to share the provided information and agree it can be
              published in the directory after verification. We may remove submissions that cannot be validated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Limitations of liability</h2>
            <p className="text-sm text-gray-700">
              We work diligently to curate accurate information, but users should conduct their own due diligence before entering
              into commercial agreements. {siteName} is not liable for direct or indirect damages arising from use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="text-sm text-gray-700">
              Questions about these terms can be directed to{" "}
              <a href="mailto:legal@pcba-finder.com" className="font-medium text-blue-600 underline">
                legal@pcba-finder.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <Script
        id="terms-websiteschema"
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
        id="terms-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms of Service",
            description: metadata.description,
            url: pageUrl,
            lastReviewed: "2024-01-05",
          }),
        }}
      />
    </div>
  )
}
