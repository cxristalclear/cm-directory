import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companySearch, parseCursor } from "@/lib/queries/companySearch"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"
import { supabase } from "@/lib/supabase"

type StateCode = "CA" | "TX" | "OH" | "MI"

const STATE_NAME_TO_CODE: Record<string, StateCode> = {
  california: "CA",
  texas: "TX",
  ohio: "OH",
  michigan: "MI",
}

const STATE_DATA: Record<
  StateCode,
  {
    name: string
    abbreviation: StateCode
    slug: string
    fullName: string
    description: string
    majorCities: string[]
  }
> = {
  CA: {
    name: "California",
    abbreviation: "CA",
    slug: "california",
    fullName: "California",
    description: "Silicon Valley and Southern California host advanced electronics and medical device manufacturers",
    majorCities: ["Los Angeles", "San Diego", "San Jose", "San Francisco"],
  },
  TX: {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    fullName: "Texas",
    description: "Major manufacturing hub with aerospace, defense, and energy sector specializations",
    majorCities: ["Houston", "Dallas", "Austin", "San Antonio"],
  },
  OH: {
    name: "Ohio",
    abbreviation: "OH",
    slug: "ohio",
    fullName: "Ohio",
    description: "Traditional manufacturing powerhouse with automotive and industrial expertise",
    majorCities: ["Columbus", "Cleveland", "Cincinnati", "Dayton"],
  },
  MI: {
    name: "Michigan",
    abbreviation: "MI",
    slug: "michigan",
    fullName: "Michigan",
    description: "Automotive manufacturing capital with growing medical device and aerospace sectors",
    majorCities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights"],
  },
}

function resolveStateData(raw: string | undefined): (typeof STATE_DATA)[StateCode] | null {
  if (!raw) {
    return null
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  const upper = trimmed.toUpperCase()
  if (upper in STATE_DATA) {
    return STATE_DATA[upper as StateCode]
  }
  const lower = trimmed.toLowerCase()
  const code = STATE_NAME_TO_CODE[lower]
  return code ? STATE_DATA[code] : null
}

export async function generateStaticParams() {
  try {
    const { data: facilities, error } = await supabase
      .from("facilities")
      .select("state")
      .not("state", "is", null)

    if (error) {
      throw error
    }

    const uniqueStates = new Set<string>()
    for (const facility of facilities ?? []) {
      const state = resolveStateData(facility?.state ?? undefined)
      if (state) {
        uniqueStates.add(state.abbreviation)
        uniqueStates.add(state.slug)
      }
    }

    if (uniqueStates.size > 0) {
      return Array.from(uniqueStates).map((state) => ({ state }))
    }
  } catch (error) {
    console.error("Failed to resolve state params", error)
  }

  return (Object.values(STATE_DATA) as Array<(typeof STATE_DATA)[StateCode]>).flatMap((state) => [
    { state: state.slug },
    { state: state.abbreviation },
  ])
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const stateData = resolveStateData(state)

  if (!stateData) {
    return {
      title: "State Not Found | CM Directory",
      description: "The requested state page could not be found.",
    }
  }

  let facilityCount = 0
  try {
    const { count, error } = await supabase
      .from("facilities")
      .select("id", { count: "exact", head: true })
      .eq("state", stateData.abbreviation)

    if (error) {
      throw error
    }

    facilityCount = count ?? 0
  } catch (error) {
    console.error("Failed to load facility count", { state: stateData.abbreviation }, error)
  }

  return {
    title: `Contract Manufacturers in ${stateData.fullName} | ${facilityCount}+ Verified Companies`,
    description: `Find ${
      facilityCount || ""
    } verified contract manufacturers in ${stateData.fullName}. ${stateData.description}. Compare capabilities, certifications, and get quotes from local manufacturing partners.`,
    openGraph: {
      title: `${stateData.fullName} Contract Manufacturers Directory`,
      description: `Browse verified contract manufacturers in ${stateData.fullName}. ${stateData.description}`,
      type: "website",
    },
    alternates: {
      canonical: `https://yourdomain.com/manufacturers/${stateData.slug}`,
    },
  }
}

export default async function StateManufacturersPage({
  params,
  searchParams,
}: {
  params: Promise<{ state: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ state }, resolvedSearch] = await Promise.all([params, searchParams])
  const stateData = resolveStateData(state)

  if (!stateData) {
    notFound()
  }

  const stateSegment = stateData.slug
  const basePath = `/manufacturers/${stateSegment}`
  const parsedFilters = parseFiltersFromSearchParams(resolvedSearch)
  const cursor = parseCursor(resolvedSearch)

  const mergedFilters = {
    ...parsedFilters,
    states: parsedFilters.states.length > 0 ? parsedFilters.states : [stateData.abbreviation],
  }

  const searchResult = await companySearch({
    filters: mergedFilters,
    routeDefaults: { state: stateData.abbreviation },
    cursor,
    includeFacetCounts: true,
  })

  const companies = sanitizeCompaniesForListing(searchResult.companies)
  const activeFilterCount =
    mergedFilters.states.length + mergedFilters.capabilities.length + (mergedFilters.productionVolume ? 1 : 0)

  const stats = {
    totalCompanies: searchResult.totalCount,
    certifications: [
      ...new Set(
        companies.flatMap((company) =>
          company.certifications
            .map((certification) => certification.certification_type)
            .filter((cert): cert is string => typeof cert === "string" && cert.length > 0),
        ),
      ),
    ],
    capabilities: [
      ...new Set(
        companies.flatMap((company) => {
          const cap = company.capabilities[0]
          const caps: string[] = []
          if (cap?.pcb_assembly_smt) caps.push("SMT Assembly")
          if (cap?.cable_harness_assembly) caps.push("Cable Assembly")
          if (cap?.box_build_assembly) caps.push("Box Build")
          if (cap?.pcb_assembly_mixed) caps.push("Mixed Technology")
          if (cap?.pcb_assembly_fine_pitch) caps.push("Fine Pitch")
          return caps
        }),
      ),
    ],
    cities: [
      ...new Set(
        companies.flatMap((company) =>
          company.facilities
            .map((facility) => facility.city)
            .filter((city): city is string => typeof city === "string" && city.length > 0),
        ),
      ),
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        totalCount={searchResult.totalCount}
        visibleCount={companies.length}
        activeFilterCount={activeFilterCount}
        clearHref={basePath}
      />

      <main className="container mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/pcb-assembly-manufacturers" className="underline">
                PCB Assembly
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">
              {stateData.name}
            </li>
          </ol>
        </nav>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-2">Contract Manufacturers in {stateData.fullName}</h1>
          <p className="text-gray-600">{stateData.description}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Verified companies</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalCompanies}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Top certifications</div>
              <div className="text-sm text-gray-900">{stats.certifications.join(", ") || "—"}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Major cities served</div>
              <div className="text-sm text-gray-900">{stats.cities.join(", ") || stateData.majorCities.join(", ")}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <FilterSidebar basePath={basePath} filters={mergedFilters} facetCounts={searchResult.facetCounts} clearHref={basePath} />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <LazyCompanyMap companies={companies} />
            <CompanyList
              companies={companies}
              totalCount={searchResult.totalCount}
              hasNext={searchResult.hasNext}
              hasPrev={searchResult.hasPrev}
              nextCursor={searchResult.nextCursor}
              prevCursor={searchResult.prevCursor}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
