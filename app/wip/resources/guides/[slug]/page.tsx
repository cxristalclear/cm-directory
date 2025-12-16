import Script from "next/script"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import Navbar from "@/components/navbar"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

type GuideArticlePageProps = {
  params: Promise<{ slug: string }>
}

const guideSummaryBySlug: Record<string, string> = {
  "vendor-qualification-framework":
    "A step-by-step roadmap for qualifying electronics contract manufacturers, from capability discovery to supplier onboarding.",
  "first-article-review-checklist":
    "Coordination guide for engineering, quality, and production teams during first article builds with manufacturing partners.",
  "supply-chain-escalation-playbook":
    "Guidance for steering cross-functional conversations when supply chain issues threaten schedules or quality metrics.",
}

const siteName = siteConfig.name

function formatGuideTitle(slug: string): string {
  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

export async function generateMetadata({ params }: GuideArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const articleTitle = formatGuideTitle(slug)
  const summary = guideSummaryBySlug[slug] ?? "Insights to collaborate effectively with electronics manufacturing partners."
  const canonicalUrl = getCanonicalUrl(`/resources/guides/${slug}`)

  return {
    title: `${articleTitle} | ${siteName} Guides`,
    description: summary,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${articleTitle} | ${siteName} Guides`,
      description: summary,
      url: canonicalUrl,
      siteName: siteName,
      type: "article",
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function GuideArticlePage({ params }: GuideArticlePageProps) {
  const { slug } = await params
  const articleTitle = formatGuideTitle(slug)
  const summary = guideSummaryBySlug[slug] ?? "Insights to collaborate effectively with electronics manufacturing partners."
  const canonicalUrl = getCanonicalUrl(`/resources/guides/${slug}`)
  const publicationDate = "2024-01-15"

  const placeholderSections = [
    {
      heading: "Executive summary",
      body: "Summarize the challenge the guide addresses, why sourcing leaders should care, and the outcomes this framework supports.",
    },
    {
      heading: "Assessment framework",
      body: "Outline the evaluation pillars, key questions to ask manufacturing partners, and the signals to collect during discovery.",
    },
    {
      heading: "Implementation next steps",
      body: "Provide action items for the first week, suggested cross-functional checkpoints, and recommended feedback cadences.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <header className="gradient-bg pb-20 pt-16 text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm uppercase tracking-wide text-blue-100">Guide</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{articleTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-blue-100">{summary}</p>
          <p className="mt-3 text-sm text-blue-200">Published January 15, 2024</p>
        </div>
      </header>

      <main className="container mx-auto -mt-12 px-4">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Resources", url: getCanonicalUrl("/resources") },
              { name: "Guides", url: getCanonicalUrl("/resources/guides") },
              { name: articleTitle, url: canonicalUrl },
            ]}
          />
        </section>

        <article className="mt-8 space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">In this guide</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {placeholderSections.map((section) => (
                <li key={section.heading} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
                  {section.heading}
                </li>
              ))}
            </ul>
          </section>

          {placeholderSections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">{section.heading}</h3>
              <p className="text-sm text-gray-700">{section.body}</p>
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Placeholder: add real content, visuals, and downloadable templates here.
              </div>
            </section>
          ))}
        </article>
      </main>

      <Script
        id="guide-websiteschema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: siteConfig.url,
          }),
        }}
      />

      <Script
        id="guide-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: articleTitle,
            description: summary,
            author: {
              "@type": "Organization",
              name: siteName,
              url: siteConfig.url,
            },
            publisher: {
              "@type": "Organization",
              name: siteName,
              url: siteConfig.url,
            },
            datePublished: publicationDate,
            dateModified: publicationDate,
            mainEntityOfPage: canonicalUrl,
          }),
        }}
      />
    </div>
  )
}
