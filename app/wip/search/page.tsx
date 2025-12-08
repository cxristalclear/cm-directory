import { Suspense } from "react"
import { Map as MapIcon } from "lucide-react"
import CompanyList from "@/components/wip/CompanyList1"
import FilterDebugger from "@/components/FilterDebugger"
import FilterBar from "@/components/FilterBar" // Your new component
import LazyCompanyMap from "@/components/wip/LazyCompanyMap1"
import VenkelAd from "@/components/VenkelAd" // Re-inserted in list
import Navbar from "@/components/navbar"
import { FilterErrorBoundary } from "@/components/FilterErrorBoundary"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import { FilterProvider } from "@/contexts/FilterContext"
import { featureFlags, siteConfig } from "@/lib/config"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import type { PageProps } from "@/types/nxt"
import SearchBar from "@/components/SearchBar"

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
const siteName = siteConfig.name

export const metadata = {
  title: `${siteName} - Find Electronics Contract Manufacturers`,
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities, certifications, industries, and location.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteName} - Electronics Contract Manufacturers`,
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${siteName} - Electronics Contract Manufacturers`,
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

  return (
      <FilterProvider initialFilters={initialFilters}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-1 container mx-auto max-w-[1600px] px-0 md:px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: The "Workhorse" List (Scrollable) */}
              {/* Spans 7 columns. Flows naturally. */}
              <div className="lg:col-span-7 px-1 md:px-0 space-y-6">
                {/* Sticky search + filters scoped to the list column */}
                <div className="sticky top-0 z-30 -mx-4 md:mx-0">                  <div className="py-3 space-y-6">
                    <div className="max-w-full">
                      <SearchBar companies={companies} variant="inline" />
                    </div>
                    <FilterBar allCompanies={companies} />
                  </div>
                </div>
                
                {/* Mobile Map Toggle (Floating Button) */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                   <button 
                     onClick={() => {/* Add map toggle logic */}}
                     className="pointer-events-auto bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-medium text-sm hover:scale-105 transition-transform"
                   >                     <MapIcon className="w-4 h-4" /> Map View
                   </button>
                </div>

                {/* Debugger if enabled */}
                <FilterErrorBoundary>
                   {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                </FilterErrorBoundary>
                
                {/* The List Component */}
                <div className="companies-directory space-y-3 min-h-[500px]">
                  <Suspense
                    fallback={
                      <div className="card-compact animate-pulse p-8 bg-white rounded-xl">
                        <div className="mb-4 h-6 w-1/4 rounded bg-slate-100" />
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 rounded-lg bg-slate-50" />
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <CompanyList allCompanies={companies} />
                  </Suspense>
                </div>

                {/* Ad placed at bottom of list or between pages */}
                <div className="pt-4">
                  <VenkelAd size="banner" className="card-compact shadow-sm border border-gray-100" />
                </div>
              </div>

              {/* RIGHT COLUMN: The "Star" Map (Sticky) */}
              {/* Spans 5 columns. Sticks to the top offset by nav+filter bar so it never scrolls away. */}
              <div className="hidden lg:block lg:col-span-5 relative h-full">
                <div className="sticky top-[10px] h-[calc(100vh-210px)] min-h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                  <MapErrorBoundary>
                    <div className="absolute inset-0 w-full h-full">
                      <LazyCompanyMap 
                        allCompanies={companies}
                      />
                    </div>
                  </MapErrorBoundary>
                </div>
              </div>

            </div>
          </main>
        </div>
      </FilterProvider>
  )
}
