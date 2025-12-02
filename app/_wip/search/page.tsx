import { Suspense } from "react"
import Script from "next/script"
import type { Metadata } from "next"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCanonicalUrl, siteConfig, featureFlags } from "@/lib/config"
import { parseFiltersFromSearchParams, type CapabilitySlug, type FilterUrlState } from "@/lib/filters/url"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import { SpeedInsights } from "@vercel/speed-insights/next"
import FilterDebugger from "@/components/FilterDebugger"
import { FilterErrorBoundary } from "@/components/FilterErrorBoundary"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import { supabase } from "@/lib/supabase"
import AddCompanyCallout from "@/components/AddCompanyCallout"
import type { PageProps } from "@/types/nxt"
import Navbar from "@/components/navbar"


const pageUrl = getCanonicalUrl("/search")

export const revalidate = 300

const COMPANY_FIELDS = `
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
  capabilities (
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

const MAX_COMPANIES = 500

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
const AdPlaceholder = ({ width, height, label, className = "" }: { width: string; height: string; label: string; className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} style={{ width, height }}>
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">{width} × {height}</div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

// ---------- Data Fetch ----------
async function getData(): Promise<HomepageCompanyWithLocations[]> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_FIELDS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(MAX_COMPANIES)
      .returns<HomepageCompanyWithLocations[]>()

    if (error) {
      console.error("Error fetching companies:", error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error("Unexpected error fetching companies:", error)
    return []
  }
}

type HomeSearchParams = Record<string, string | string[] | undefined>

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

  if (filterState.employeeCountRanges.length > 0) {
    filterState.employeeCountRanges.forEach(range => {
      labels.push(`Employees: ${range}`)
    })
  }

  if (filterState.searchQuery?.trim()) {
    labels.push(`Name: ${filterState.searchQuery.trim()}`)
  }
  return labels
}

export default async function SearchPage({
  searchParams,
}: PageProps<Record<string, string | string[]>, HomeSearchParams>) {
  const resolvedSearchParams: HomeSearchParams = (await searchParams) ?? {}

  const filterState = parseFiltersFromSearchParams(resolvedSearchParams)
  
  // Only pass the fields that FilterProvider expects
  const initialFilters = {
    countries: filterState.countries,
    states: filterState.states,
    capabilities: filterState.capabilities,
    productionVolume: filterState.productionVolume,
    employeeCountRanges: filterState.employeeCountRanges,
    searchQuery: filterState.searchQuery,
  }

  const companies = await getData()
  const activeFilterLabels = buildActiveFilterLabels(filterState)

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    <SpeedInsights />
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <header className="relative overflow-hidden">
        <div className="gradient-bg">
          <div className="relative z-10 py-8 md:py-12">
            <div className="container mx-auto px-4 text-center">
              <div className="mx-auto max-w-4xl">
                <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-5xl">
                  Find Your Next Manufacturing Partner
                </h1>
                <p className="mb-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                  Connect with verified contract manufacturers. Use interactive filters to discover contract manufacturers aligned with your technical, compliance, and capacity requirements.
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>
      </header>        <main className="container mx-auto -mt-12 px-4 pb-16">
          <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur">
            <Breadcrumbs
              items={[
                { name: "Home", url: "/" },
                { name: "Find a Manufacturer", url: pageUrl },
              ]}
            />
          </div>
          <section className="mt-8 space-y-6">

            {/* Top Content Ad - Native/Sponsored */}
            <div className="mb-6 bg-white rounded-xl shadow-xl p-4">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Featured Partner</div>
              <AdPlaceholder
                width="100%"
                height="120px"
                label="Sponsored Content / Featured Manufacturer"
                className="border-blue-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Filter Sidebar */}
              <aside className="space-y-4 lg:col-span-4">
                <FilterErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                        Loading filters…
                      </div>
                    }
                  >
                    <FilterSidebar allCompanies={companies} />
                    {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                  </Suspense>
                </FilterErrorBoundary>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Filter Guidance</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Layer geography, certifications, and production volume requirements to refine your shortlist. Export and share
                    results once you find the right partners.
                  </p>
                </div>

                {/* Bottom Sidebar Ad */}
                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
                <AddCompanyCallout className="mt-12" />
              </aside>

              <section className="space-y-6 lg:col-span-8">
                <div className="rounded-3xl border border-blue-100 bg-white shadow-xl">
                  {/* Map with Error Boundary */}
                  <MapErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="h-72 w-full animate-pulse rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100" />
                    }
                  >
                    <LazyCompanyMap allCompanies={companies} />
                  </Suspense>
                  </MapErrorBoundary>
                </div>
                
                {/* Active Filters and Sorting Bar */}
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
                            className="btn btn--pill btn--pill-primary shadow-sm"
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

                {/* List */}
                <div className="companies-directory">
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
                    <CompanyList allCompanies={companies} />
                  </Suspense>
                </div>
              </section>
            </div>
            {/* Bottom Content Ad */}
            <div className="bg-white rounded-xl shadow-xl p-4">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide text-center">Sponsored</div>
              <AdPlaceholder
                width="100%"
                height="150px"
                label="Bottom Banner / Native Content"
                className="border-green-200"
              />
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
    </Suspense>
  )
}
