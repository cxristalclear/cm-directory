import { Suspense } from "react"
import Script from "next/script"
import type { Metadata } from "next"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { parseFiltersFromSearchParams, type CapabilitySlug, type FilterUrlState } from "@/lib/filters/url"
import type { HomepageCompany } from "@/types/homepage"

const pageUrl = getCanonicalUrl("/search")

export const metadata: Metadata = {
  title: "Find a Manufacturer | Contract Manufacturer Directory",
  description:
    "Search and filter verified electronics contract manufacturers by capabilities, certifications, location, and production needs.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Find a Manufacturer | Contract Manufacturer Directory",
    description:
      "Discover electronics manufacturers with the right mix of certifications, capabilities, and capacity.",
    url: pageUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a Manufacturer | Contract Manufacturer Directory",
    description: "Build a shortlist of verified manufacturers tailored to your requirements.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const placeholderCompanies: HomepageCompany[] = []

const capabilityLabels: Record<CapabilitySlug, string> = {
  smt: "Surface Mount (SMT)",
  through_hole: "Through-Hole Assembly",
  cable_harness: "Cable & Harness Assembly",
  box_build: "Box Build Assembly",
  prototyping: "Prototyping Support",
}

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "recent", label: "Recently Updated" },
  { value: "alphabetical", label: "Alphabetical" },
]

function formatVolumeLabel(volume: FilterUrlState["productionVolume"]): string | null {
  if (!volume) {
    return null
  }

  if (volume === "low") {
    return "Production Volume: Low"
  }
  if (volume === "medium") {
    return "Production Volume: Medium"
  }
  if (volume === "high") {
    return "Production Volume: High"
  }

  return null
}

function buildActiveFilterLabels(filterState: FilterUrlState): string[] {
  const labels: string[] = []

  filterState.countries.forEach((country) => {
    labels.push(`Country: ${country}`)
  })

  filterState.states.forEach((stateCode) => {
    labels.push(`State: ${stateCode}`)
  })

  filterState.capabilities.forEach((capability) => {
    const label = capabilityLabels[capability] ?? capability
    labels.push(`Capability: ${label}`)
  })

  const volumeLabel = formatVolumeLabel(filterState.productionVolume)
  if (volumeLabel) {
    labels.push(volumeLabel)
  }

  return labels
}

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const filterState = parseFiltersFromSearchParams(resolvedSearchParams)
  const initialFilters = {
    countries: filterState.countries,
    states: filterState.states,
    capabilities: filterState.capabilities,
    productionVolume: filterState.productionVolume,
  }

  const activeFilterLabels = buildActiveFilterLabels(filterState)

  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <header className="gradient-bg pb-16 pt-12 text-white">
          <div className="container mx-auto px-4">
            <p className="text-sm uppercase tracking-widest text-blue-100">Directory Search</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Find a Manufacturer</h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              Use interactive filters to discover contract manufacturers aligned with your technical, compliance, and capacity
              requirements.
            </p>
          </div>
        </header>

        <main className="container mx-auto -mt-12 px-4 pb-16">
          <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
            <Breadcrumbs
              items={[
                { name: "Home", url: "/" },
                { name: "Find a Manufacturer", url: pageUrl },
              ]}
            />
          </div>

          <section className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <aside className="space-y-4 lg:col-span-4">
                <Suspense
                  fallback={
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                      Loading filters…
                    </div>
                  }
                >
                  <FilterSidebar allCompanies={placeholderCompanies} />
                </Suspense>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Filter Guidance</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Layer geography, certifications, and production volume requirements to refine your shortlist. Export and share
                    results once you find the right partners.
                  </p>
                </div>
              </aside>

              <section className="space-y-6 lg:col-span-8">
                <div className="rounded-3xl border border-blue-100 bg-white shadow-xl">
                  <Suspense
                    fallback={
                      <div className="h-72 w-full animate-pulse rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100" />
                    }
                  >
                    <LazyCompanyMap allCompanies={placeholderCompanies} />
                  </Suspense>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {activeFilterLabels.length === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                          No active filters
                        </span>
                      ) : (
                        activeFilterLabels.map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm"
                            aria-label={`Active filter ${label}`}
                          >
                            {label}
                            <span aria-hidden="true">×</span>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="search-sort" className="text-sm font-medium text-gray-700">
                        Sort by
                      </label>
                      <select
                        id="search-sort"
                        name="sort"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        defaultValue={sortOptions[0]?.value}
                        aria-label="Sort search results"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <Suspense
                    fallback={
                      <div className="space-y-4 p-6">
                        <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
                        <div className="space-y-3">
                          {[1, 2, 3].map((skeleton) => (
                            <div key={skeleton} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <CompanyList allCompanies={placeholderCompanies} />
                  </Suspense>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>

      <Script
        id="search-websiteschema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteConfig.url}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </FilterProvider>
  )
}
