import { Suspense } from "react"
import Script from "next/script"

import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import CompanyList from "@/components/CompanyList"
import FilterDebugger from "@/components/FilterDebugger"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { FilterProvider } from "@/contexts/FilterContext"
import { fetchCompaniesStub } from "@/lib/companies/stubData"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import type { ProductionVolume } from "@/types/company"
import { getStateName } from "@/utils/stateMapping"

export const metadata = {
  title:
    "CM Directory — Find Electronics Contract Manufacturers (PCB Assembly, Box Build, Cable Harness)",
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

const CAPABILITY_LABELS: Record<string, string> = {
  smt: "SMT",
  through_hole: "Through-Hole",
  cable_harness: "Cable Harness",
  box_build: "Box Build",
  prototyping: "Prototyping",
}

const VOLUME_LABELS: Record<ProductionVolume, string> = {
  low: "Low Volume",
  medium: "Medium Volume",
  high: "High Volume",
}

type SearchParams = Record<string, string | string[] | undefined>

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

const AdPlaceholder = ({
  width,
  height,
  label,
  className = "",
}: {
  width: string
  height: string
  label: string
  className?: string
}) => (
  <div
    className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
    style={{ width, height }}
  >
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">{width} × {height}</div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

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

function getCursor(searchParams?: SearchParams): string | null {
  if (!searchParams) {
    return null
  }

  const value = searchParams.cursor
  if (!value) {
    return null
  }

  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0]
  }

  return null
}

function buildStateOptions(counts: Record<string, number>): FilterOption<string>[] {
  return Object.entries(counts)
    .map(([code, count]) => ({
      value: code,
      label: getStateName(code),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function buildCapabilityOptions(
  counts: Record<string, number>,
): FilterOption<string>[] {
  return Object.entries(counts)
    .map(([key, count]) => ({
      value: key,
      label: CAPABILITY_LABELS[key] ?? key,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function buildVolumeOptions(
  counts: Record<ProductionVolume, number>,
): FilterOption<ProductionVolume>[] {
  return (Object.keys(VOLUME_LABELS) as ProductionVolume[]).map(volume => ({
    value: volume,
    label: VOLUME_LABELS[volume],
    count: counts[volume] ?? 0,
  }))
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  const filters = parseFiltersFromSearchParams(toRecord(searchParams))
  const cursor = getCursor(searchParams)

  const { companies, totalCount, facetCounts, pageInfo } = await fetchCompaniesStub(filters, cursor)

  const stateOptions = buildStateOptions(facetCounts.states)
  const capabilityOptions = buildCapabilityOptions(facetCounts.capabilities)
  const volumeOptions = buildVolumeOptions(facetCounts.productionVolume)

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
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
        }}
      />
      <FilterProvider initialFilters={filters} initialFilteredCount={totalCount}>
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
                  {SHOW_DEBUG && <FilterDebugger companies={companies} totalCount={totalCount} />}
                </Suspense>

                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
              </div>

              <div className="space-y-4 lg:col-span-9">
                <LazyCompanyMap companies={companies} />

                <div className="companies-directory">
                  <Suspense fallback={<div>Loading companies...</div>}>
                    <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
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
