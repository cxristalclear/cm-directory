import { Suspense, cache } from "react"
import Script from "next/script"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import FilterDebugger from "@/components/FilterDebugger"
import Header from "@/components/Header"
import { FilterErrorBoundary } from "@/components/FilterErrorBoundary"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import { siteConfig, featureFlags } from "@/lib/config"
import AddCompanyCallout from "@/components/AddCompanyCallout"
import type { HomepageCompany } from "@/types/homepage"

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
    country,
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
    certification_name,
    certification_type
  ),
  industries (
    id,
    industry_name
  )
`

const MAX_COMPANIES = 500
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "CM Directory — Find Electronics Contract Manufacturers (PCB Assembly, Box Build, Cable Harness)",
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), industries, and state.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Filter verified manufacturers by capability, certification, and location.",
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
const getData = cache(async function getData(): Promise<HomepageCompany[]> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select<HomepageCompany>(COMPANY_FIELDS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(MAX_COMPANIES)

    if (error) {
      console.error('Error fetching companies:', error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error('Unexpected error fetching companies:', error)
    return []
  }
})

export default async function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const initialFilters = parseFiltersFromSearchParams(searchParams ?? {})

  // Fetch DB rows (nullable), then normalize to strict app types once here.
  const companies = await getData()

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <SpeedInsights />
      {/* Website JSON-LD */}
      <Script id="website-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })
      }} />
      
      <FilterProvider initialFilters={initialFilters}>
        <div className="min-h-screen bg-gray-50">
          <Header />

          <main className="container mx-auto px-4 py-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <FilterErrorBoundary>
                  <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">Loading filters...</div>}>
                    <FilterSidebar allCompanies={companies} />
                    {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                  </Suspense>
                </FilterErrorBoundary>

                {/* Bottom Sidebar Ad */}
                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
              </div>

              <div className="lg:col-span-9 space-y-4">
                {/* Map with Error Boundary */}
                <MapErrorBoundary>
                  <LazyCompanyMap allCompanies={companies} />
                </MapErrorBoundary>

                {/* List */}
                <div className="companies-directory">
                  <Suspense fallback={
                    <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  }>
                    <CompanyList allCompanies={companies} />
                  </Suspense>
                </div>
                <AddCompanyCallout className="mt-12" />
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
              </div>
            </div>
          </main>
        </div>
      </FilterProvider>
    </Suspense>
  )
}
