import Script from "next/script"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

const pageUrl = getCanonicalUrl("/privacy")
const siteName = siteConfig.name

export const metadata: Metadata = {
  title: "Privacy Policy | Contract Manufacturer Directory",
  description:
    "Learn how Contract Manufacturer Directory collects, uses, and safeguards your information when you browse or contribute data.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Privacy Policy | Contract Manufacturer Directory",
    description: `Details on data collection, usage, and security practices for ${siteName}.`,
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy",
    description: `Understand how ${siteName} protects community and customer data.`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Privacy</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            We take privacy seriously when it comes to sourcing data, company submissions, and community research on manufacturing
            partners.
          </p>
          <p className="mt-5 text-sm text-blue-200">Last updated: January 5, 2024</p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Privacy", url: pageUrl },
            ]}
          />
        </section>

        <article className="mt-8 space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Information we collect</h2>
            <p className="text-sm text-gray-700">
              We gather directory browsing analytics, manufacturer submissions, and support requests so we can improve the product,
              vet companies, and collaborate with sourcing teams. Personally identifiable information is limited to details that team
              members explicitly provide when contacting us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">How data is used</h2>
            <p className="text-sm text-gray-700">
              Directory usage patterns help us prioritize new features and content. Company submission data is reviewed by our
              operations team and published only after verification. We never sell or lease data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Data security</h2>
            <p className="text-sm text-gray-700">
              Access to internal systems is restricted to core team members with multi-factor authentication. We retain submission
              records for auditability and remove them upon verified request from the submitting party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Your choices</h2>
            <p className="text-sm text-gray-700">
              Contact{" "}
              <a href="mailto:privacy@cm-directory.com" className="font-medium text-blue-600 underline">
                privacy@cm-directory.com
              </a>{" "}
              to request data removal or to ask questions about this policy. We respond to verified requests within 5 business days.
            </p>
          </section>
        </article>
      </main>

      <Script
        id="privacy-websiteschema"
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
        id="privacy-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy",
            description: metadata.description,
            url: pageUrl,
            lastReviewed: "2024-01-05",
          }),
        }}
      />
    </div>
  )
}
