import Script from "next/script"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

const pageUrl = getCanonicalUrl("/contact")
const siteName = siteConfig.name

export const metadata: Metadata = {
  title: "Contact | Contract Manufacturer Directory",
  description:
    "Connect with the Contract Manufacturer Directory team for support, media inquiries, or partnership opportunities.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Contact | Contract Manufacturer Directory",
    description: `Get in touch with ${siteName} for help with sourcing manufacturers or updating your company profile.`,
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Contact ${siteName}`,
    description: `Reach the ${siteName} team for support and collaboration requests.`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Support & Partnerships</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Contact {siteName}</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            We help engineering, operations, and sourcing teams find the right manufacturing partners. Reach out and we will
            respond within one business day.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Contact", url: pageUrl },
            ]}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-900">Send us a message</h2>
            <p className="mt-2 text-sm text-gray-600">
              Share your project requirements, press inquiry, or support question. A member of the team will reach out with next
              steps.
            </p>

            <form className="mt-8 space-y-6" aria-label="Contact form">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
                  Work email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Describe your project, timeline, or questions for the team."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg shadow-lg"
              >
                Submit request
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-6 shadow-inner">
              <h2 className="text-lg font-semibold text-blue-900">FAQ / Help</h2>
              <ul className="mt-4 space-y-4 text-sm text-blue-900/80">
                <li className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm">
                  <p className="font-medium text-blue-900">Need to update your company profile?</p>
                  <p className="mt-1 text-blue-700">
                    Send the latest certifications, capabilities, or facility changes and we will refresh your listing.
                  </p>
                </li>
                <li className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm">
                  <p className="font-medium text-blue-900">Looking for a specific capability?</p>
                  <p className="mt-1 text-blue-700">
                    Share the requirement details and we will highlight manufacturers that match your build criteria.
                  </p>
                </li>
                <li className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm">
                  <p className="font-medium text-blue-900">Media or partnership inquiry?</p>
                  <p className="mt-1 text-blue-700">
                    Include your publication or organization, and our partnerships team will connect shortly.
                  </p>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Office hours</h3>
              <p className="mt-2 text-sm text-gray-600">Monday – Friday, 8:00 AM to 6:00 PM PT</p>
              <p className="mt-4 text-sm text-gray-600">
                Prefer email? Contact us at{" "}
                <a href="mailto:team@cm-directory.com" className="font-medium text-blue-600 underline">
                  team@cm-directory.com
                </a>
              </p>
            </div>
          </aside>
        </section>
      </main>

      <Script
        id="contact-websiteschema"
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
        id="contact-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I update our manufacturer profile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Email the latest certifications, capabilities, and facility updates to team@cm-directory.com and the directory will be refreshed within two business days.",
                },
              },
              {
                "@type": "Question",
                name: "Can you recommend manufacturers for a specific build?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Share the production volume, industry requirements, and timeline. Our team will surface a shortlist of manufacturers that align with those criteria.",
                },
              },
              {
                "@type": "Question",
                name: "Who should I contact for media or partnership requests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Reach out via the contact form or email team@cm-directory.com with your publication or organization details and the partnerships team will follow up.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
