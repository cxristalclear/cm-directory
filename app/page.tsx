import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import CompanyList from "@/components/CompanyList"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import Navbar from "@/components/navbar"
import FilterBar from "@/components/FilterBar"
import { FilterProvider } from "@/contexts/FilterContext"
import { featureFlags, siteConfig } from "@/lib/config"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import type { PageProps } from "@/types/nxt"
import SearchBar from "@/components/SearchBar"
import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import AddCompanyCallout from "@/components/AddCompanyCallout"
import FilterErrorBoundary from "@/components/FilterErrorBoundary"
import FilterSidebar from "@/components/FilterSidebar"
import FilterDebugger from "@/components/FilterDebugger"
import VenkelAd from "@/components/VenkelAd"

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

export const metadata = {
  title: "PCBA Finder - Find Electronics Contract Manufacturers",
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities, certifications, industries, and location.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: "PCBA Finder - Electronics Contract Manufacturers",
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PCBA Finder - Electronics Contract Manufacturers",
    description:
      "Filter verified manufacturers by capability, certification, and location.",
  },
}

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

export default async function Home({
  searchParams,
}: PageProps<Record<string, string | string[]>, HomeSearchParams>) {
  const resolvedSearchParams: HomeSearchParams = (await searchParams) ?? {}
  const initialFilters = parseFiltersFromSearchParams(resolvedSearchParams)
  const companies = await getData()
  const useHorizontalFilterBar = false

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SpeedInsights />
      <FilterProvider initialFilters={initialFilters}>
        <div className="page-shell">
          <Navbar />
          <Header />
          
          <main className="page-container section section--tight space-y-4">
            {/* Top Ad Removed to bring content higher */}

            {useHorizontalFilterBar ? (
              <div className="space-y-3">
                <SearchBar companies={companies} variant="inline" />
                <FilterBar allCompanies={companies} />
                <ActiveFiltersBar variant="inline" />
                <div className="flex justify-center">
                  <div className="w-full lg:w-full">
                    <MapErrorBoundary>
                      <LazyCompanyMap allCompanies={companies} />
                    </MapErrorBoundary>
                  </div>
                </div>

                <div className="companies-directory space-y-3">
                  <Suspense
                    fallback={
                      <div className="card-compact animate-pulse p-8">
                        <div className="mb-4 h-6 w-1/4 rounded bg-muted" />
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 rounded-md bg-muted" />
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <CompanyList allCompanies={companies} showInlineSearch={false} />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-x-[15px] items-start">
                {/* Sidebar - Sticky, centered within its column while still left of the map */}
                <div className="lg:col-span-2 space-y-3 sticky top-4 z-10 lg:order-first lg:flex lg:flex-col lg:items-center lg:mx-auto">
                  <FilterErrorBoundary>
                    <Suspense fallback={<div className="card-compact animate-pulse p-4">Loading filters...</div>}>
                      <FilterSidebar allCompanies={companies} />
                      {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                    </Suspense>
                  </FilterErrorBoundary>

                  <VenkelAd size="sidebar" className="card-compact w-full" />
                  
                  <AddCompanyCallout />
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-10 space-y-5 lg:order-last">
                  <SearchBar companies={companies} variant="inline" />
                  <ActiveFiltersBar variant="inline" />

                  <div className="flex justify-center">
                    <div className="w-full lg:w-full rounded-2xl border border-gray-200 bg-slate-50 shadow-sm overflow-hidden">
                      <MapErrorBoundary>
                        <LazyCompanyMap allCompanies={companies} />
                      </MapErrorBoundary>
                    </div>
                  </div>

                  <div className="companies-directory space-y-3 mt-6">
                    <Suspense
                      fallback={
                        <div className="card-compact animate-pulse p-8">
                          <div className="mb-4 h-6 w-1/4 rounded bg-muted" />
                          <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="h-24 rounded-md bg-muted" />
                            ))}
                          </div>
                        </div>
                      }
                    >
                      <CompanyList allCompanies={companies} showInlineSearch={false} />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </FilterProvider>
    </Suspense>
  )
}
