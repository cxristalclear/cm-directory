import { Suspense } from "react"
import Script from "next/script"

import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import CompanyList from "@/components/CompanyList"
import FilterDebugger from "@/components/FilterDebugger"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import type { Company, FilterState, ProductionVolume } from "@/types/company"
import { filterCompanies } from "@/utils/filtering"
import { getStateName } from "@/utils/stateMapping"

export const metadata = {
  title: "CM Directory — Find Electronics Contract Manufacturers (PCB Assembly, Box Build, Cable Harness)",
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), industries, and state.",
  alternates: { canonical: "https://www.example.com/" },
  openGraph: {
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: "https://www.example.com/",
    siteName: "CM Directory",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Filter verified manufacturers by capability, certification, and location.",
  },
}

const SHOW_DEBUG = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true"

const AdPlaceholder = ({ width, height, label, className = "" }: { width: string; height: string; label: string; className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} style={{ width, height }}>
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">{width} × {height}</div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

async function getData(): Promise<Company[]> {
  const { data: companies, error } = await supabase
    .from("companies")
    .select(`
      *,
      facilities(*),
      capabilities(*),
      certifications(*),
      industries(*)
    `)
    .eq("is_active", true)

  if (error || !companies) return []
  return companies
}

type SearchParams = Record<string, string | string[] | undefined>

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

type CapabilityRecord = NonNullable<Company["capabilities"]>[0] | undefined

const CAPABILITY_CONFIG: { value: string; label: string; predicate: (capability: CapabilityRecord) => boolean }[] = [
  { value: "smt", label: "SMT", predicate: capability => Boolean(capability?.pcb_assembly_smt) },
  { value: "through_hole", label: "Through-Hole", predicate: capability => Boolean(capability?.pcb_assembly_through_hole) },
  { value: "cable_harness", label: "Cable Harness", predicate: capability => Boolean(capability?.cable_harness_assembly) },
  { value: "box_build", label: "Box Build", predicate: capability => Boolean(capability?.box_build_assembly) },
  { value: "prototyping", label: "Prototyping", predicate: capability => Boolean(capability?.prototyping) },
]

const VOLUME_CONFIG: { value: ProductionVolume; label: string; predicate: (capability: CapabilityRecord) => boolean }[] = [
  { value: "low", label: "Low Volume", predicate: capability => Boolean(capability?.low_volume_production) },
  { value: "medium", label: "Medium Volume", predicate: capability => Boolean(capability?.medium_volume_production) },
  { value: "high", label: "High Volume", predicate: capability => Boolean(capability?.high_volume_production) },
]

function toRecord(searchParams?: SearchParams): Record<string, string | string[]> {
  const record: Record<string, string | string[]> = {}
  if (!searchParams) {
    return record
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      record[key] = value
    } else if (Array.isArray(value)) {
      record[key] = value
    }
  }

  return record
}

function createInitialFilters(searchParams?: SearchParams): FilterState {
  const parsed = parseFiltersFromSearchParams(toRecord(searchParams))
  return {
    states: parsed.states,
    capabilities: parsed.capabilities,
    productionVolume: parsed.productionVolume,
  }
}

function buildStateOptions(companies: Company[]): FilterOption<string>[] {
  const counts = new Map<string, number>()

  companies.forEach(company => {
    company.facilities?.forEach(facility => {
      if (facility?.state) {
        const code = facility.state.toUpperCase()
        counts.set(code, (counts.get(code) ?? 0) + 1)
      }
    })
  })

  return Array.from(counts.entries())
    .map(([code, count]) => ({
      value: code,
      label: getStateName(code),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function buildCapabilityOptions(companies: Company[]): FilterOption<string>[] {
  const counts = new Map<string, number>()

  companies.forEach(company => {
    const capabilityRecord = company.capabilities?.[0]
    CAPABILITY_CONFIG.forEach(({ value, predicate }) => {
      if (predicate(capabilityRecord)) {
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }
    })
  })

  return CAPABILITY_CONFIG.map(({ value, label }) => ({
    value,
    label,
    count: counts.get(value) ?? 0,
  }))
}

function buildVolumeOptions(companies: Company[]): FilterOption<ProductionVolume>[] {
  const counts = new Map<ProductionVolume, number>()

  companies.forEach(company => {
    const capabilityRecord = company.capabilities?.[0]
    VOLUME_CONFIG.forEach(({ value, predicate }) => {
      if (predicate(capabilityRecord)) {
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }
    })
  })

  return VOLUME_CONFIG.map(({ value, label }) => ({
    value,
    label,
    count: counts.get(value) ?? 0,
  }))
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  const companies = await getData()
  const initialFilters = createInitialFilters(searchParams)
  const initialFilteredCount = filterCompanies(companies, initialFilters).length
  const stateOptions = buildStateOptions(companies)
  const capabilityOptions = buildCapabilityOptions(companies)
  const volumeOptions = buildVolumeOptions(companies)

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <Script id="website-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CM Directory",
          url: "https://www.example.com/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.example.com/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      }} />
      <FilterProvider initialFilters={initialFilters} initialFilteredCount={initialFilteredCount}>
        <div className="min-h-screen bg-gray-50">
          <Header />

          <main className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <ActiveFiltersBar />
            </div>

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
              <div className="space-y-4 lg:col-span-3">
                <Suspense fallback={<div>Loading filters...</div>}>
                  <FilterSidebar
                    stateOptions={stateOptions}
                    capabilityOptions={capabilityOptions}
                    volumeOptions={volumeOptions}
                  />
                  {SHOW_DEBUG && <FilterDebugger allCompanies={companies} />}
                </Suspense>

                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
              </div>

              <div className="space-y-4 lg:col-span-9">
                <LazyCompanyMap allCompanies={companies} />

                <div className="companies-directory">
                  <Suspense fallback={<div>Loading companies...</div>}>
                    <CompanyList allCompanies={companies} />
                  </Suspense>
                </div>

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
