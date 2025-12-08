import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { getCapabilityDefinition, CAPABILITY_DEFINITIONS } from "@/lib/capabilities"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import {
  createCollectionPageJsonLd,
  jsonLdScriptProps,
  type JsonLd,
} from "@/lib/schema"
import { supabase } from "@/lib/supabase"
import type { HomepageCompanyWithLocations } from "@/types/homepage"

const siteName = siteConfig.name

const HOMEPAGE_COMPANY_FIELDS = `
  id,
  slug,
  company_name,
  dba_name,
  description,
  employee_count_range,
  is_active,
  website_url,
  updated_at,
  facilities (
    id,
    company_id,
    city,
    state,
    state_code,
    state_province,
    country,
    country_code,
    latitude,
    longitude,
    facility_type,
    is_primary
  ),
  capabilities!inner (
    pcb_assembly_smt,
    pcb_assembly_through_hole,
    cable_harness_assembly,
    box_build_assembly,
    prototyping,
    low_volume_production,
    medium_volume_production,
    high_volume_production
  ),
  certifications (
    id,
    certification_type
  ),
  industries (
    id,
    industry_name
  )
`

export async function generateStaticParams() {
  return CAPABILITY_DEFINITIONS.map(({ slug }) => ({
    capability: slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ capability: string }>
}): Promise<Metadata> {
  const { capability } = await params
  const definition = getCapabilityDefinition(capability)

  if (!definition) {
    return {
      title: `Capability Not Found | ${siteName}`,
      description: "The requested capability page could not be found.",
    }
  }

  const pageUrl = getCanonicalUrl(`/capabilities/${definition.slug}`)

  return {
    title: `${definition.title} | ${siteName}`,
    description: definition.summary,
    openGraph: {
      title: definition.title,
      description: definition.description,
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: definition.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.title,
      description: definition.summary,
      images: [
        {
          url: siteConfig.ogImage,
          alt: definition.title,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function CapabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ capability: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ capability }, sp] = await Promise.all([params, searchParams])
  const definition = getCapabilityDefinition(capability)

  if (!definition) {
    notFound()
  }

  const urlFilters = parseFiltersFromSearchParams(sp)
  const initialFilters = {
    countries: urlFilters.countries,
    states: urlFilters.states,
    capabilities:
      urlFilters.capabilities.length > 0
        ? urlFilters.capabilities
        : definition.defaultFilters,
    productionVolume: urlFilters.productionVolume,
    employeeCountRanges: urlFilters.employeeCountRanges,
    searchQuery: urlFilters.searchQuery,
  }

  let query = supabase
    .from("companies")
    .select(HOMEPAGE_COMPANY_FIELDS)
    .eq("is_active", true)

  for (const filter of definition.supabaseFilters) {
    query = query.eq(`capabilities.${filter.column}`, filter.value)
  }

  let typedCompanies: HomepageCompanyWithLocations[] = []
  try {
    const { data, error } = await query.returns<HomepageCompanyWithLocations[]>()
    if (error) {
      throw error
    }
    typedCompanies = data ?? []
  } catch (error) {
    console.error(
      `[capabilities-page] companies query failed for capability "${definition.slug}"`,
      error,
    )
    throw error
  }

  const canonicalUrl = getCanonicalUrl(`/capabilities/${definition.slug}`)
  const breadcrumbBaseUrl = getCanonicalUrl("/capabilities")
  const collectionSchema = createCollectionPageJsonLd({
    name: definition.title,
    description: definition.summary,
    url: canonicalUrl,
    numberOfItems: typedCompanies.length,
    breadcrumbs: [
      { name: "Home", url: getCanonicalUrl("/") },
      { name: "Capabilities", url: breadcrumbBaseUrl },
      { name: definition.name, url: canonicalUrl },
    ],
  })

  const faqSchema: JsonLd<{
    "@type": "FAQPage"
    mainEntity: Array<{
      "@type": "Question"
      name: string
      acceptedAnswer: { "@type": "Answer"; text: string }
    }>
  }> | null = definition.faq && definition.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: definition.faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      }
    : null

  const howToSchema: JsonLd<{
    "@type": "HowTo"
    name: string
    step: Array<{ "@type": "HowToStep"; name: string }>
  }> | null = definition.howTo
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: definition.howTo.title,
        step: definition.howTo.steps.map(step => ({
          "@type": "HowToStep",
          name: step,
        })),
      }
    : null

  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <script {...jsonLdScriptProps(collectionSchema)} />
        {faqSchema ? <script {...jsonLdScriptProps(faqSchema)} /> : null}
        {howToSchema ? <script {...jsonLdScriptProps(howToSchema)} /> : null}

        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/capabilities" className="hover:text-white">
                Capabilities
              </Link>
              <span>/</span>
              <span className="text-white">{definition.name}</span>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-semibold backdrop-blur">
                {definition.name
                  .split(" ")
                  .map(word => word[0])
                  .join("")}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">{definition.title}</h1>
                <p className="text-xl text-blue-100 max-w-3xl">{definition.description}</p>
                <div className="inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2 text-blue-100">
                  <span className="text-2xl font-semibold text-white">{typedCompanies.length}</span>
                  <span>Verified suppliers with {definition.name.toLowerCase()} capability</span>
                </div>
                <p className="text-blue-100">{definition.heroHighlight}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-8">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-semibold">How {siteName} scores {definition.name}</h2>
                <p className="mt-3 text-gray-600">{definition.summary}</p>
                <ul className="mt-6 list-disc space-y-2 pl-5 text-gray-700">
                  {definition.evaluationCriteria.map(criteria => (
                    <li key={criteria}>{criteria}</li>
                  ))}
                </ul>
                {definition.howTo ? (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold">{definition.howTo.title}</h3>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
                      {definition.howTo.steps.map(step => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>

              {definition.faq && definition.faq.length > 0 ? (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold">Capability FAQ</h2>
                  <div className="mt-4 space-y-4">
                    {definition.faq.map(({ question, answer }) => (
                      <div key={question} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
                        <p className="mt-2 text-gray-700">{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <FilterSidebar allCompanies={typedCompanies} />
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <CompanyList allCompanies={typedCompanies} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  )
}
