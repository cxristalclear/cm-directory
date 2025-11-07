import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
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
import VenkelAd from "@/components/VenkelAd"
import type { PageProps } from "@/types/nxt"
import type { HomepageCompany } from "@/types/homepage"
import Navbar from "@/components/navbar"

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
    certification_type
  ),
  industries (
    id,
    industry_name
  )
`

const MAX_COMPANIES = 500

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

// ---------- Data Fetch ----------
async function getData(): Promise<HomepageCompany[]> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_FIELDS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(MAX_COMPANIES)
      .returns<HomepageCompany[]>()

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

export default async function Home({
  searchParams,
}: PageProps<Record<string, string | string[]>, HomeSearchParams>) {
  const resolvedSearchParams: HomeSearchParams = (await searchParams) ?? {}

  const initialFilters = parseFiltersFromSearchParams(resolvedSearchParams)

  // Fetch DB rows (nullable), then normalize to strict app types once here.
  const companies = await getData()

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <SpeedInsights />
      <FilterProvider initialFilters={initialFilters}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Header />
          <main className="container mx-auto px-4 py-6">
            {/* Top Venkel Ad - Banner */}
            <VenkelAd size="banner" className="mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <FilterErrorBoundary>
                  <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">Loading filters...</div>}>
                    <FilterSidebar allCompanies={companies} />
                    {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                  </Suspense>
                </FilterErrorBoundary>

                {/* Sidebar Venkel Ad */}
                <VenkelAd size="sidebar" />
                <AddCompanyCallout className="mt-12" />
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
                
                {/* Bottom Venkel Ad - Banner */}
                <VenkelAd size="banner" />
              </div>
            </div>
          </main>
        </div>
      </FilterProvider>
    </Suspense>
  )
}
