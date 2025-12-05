import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import {
  createCollectionPageJsonLd,
  jsonLdScriptProps,
} from "@/lib/schema"
import {
  getAllStateMetadata,
  getStateMetadataBySlug,
  stateSlugFromAbbreviation,
} from "@/lib/states"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"

const cityListFormatter = new Intl.ListFormat("en-US", {
  style: "long",
  type: "conjunction",
})

const siteName = siteConfig.name

const formatCityList = (cities: string[]): string | null => {
  if (cities.length === 0) {
    return null
  }

  return cityListFormatter.format(cities)
}

// Generate static params for all states
export async function generateStaticParams() {
  const { data: facilities } = await supabase
    .from("facilities")
    .select("state_code")
    .not("state_code", "is", null)

  type FacilityState = { state_code: string | null }
  const typedFacilities = (facilities || []) as FacilityState[]

  const uniqueSlugs = new Set<string>()

  typedFacilities
    .map((facility) => facility.state_code)
    .filter((state): state is string => typeof state === "string" && state.length > 0)
    .forEach((state) => {
      const slug = stateSlugFromAbbreviation(state)
      if (slug) {
        uniqueSlugs.add(slug)
      }
    })

  return Array.from(uniqueSlugs).map((state) => ({ state }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const stateMetadata = getStateMetadataBySlug(state)

  if (!stateMetadata) {
    return {
      title: `State Not Found | ${siteName}`,
      description: "The requested state page could not be found.",
    }
  }

  const { count } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true })
    .eq("state_code", stateMetadata.abbreviation)

  const companyCount = count ?? 0
  const countLabel = companyCount > 0 ? `${companyCount}+` : ""
  const titleCountLabel = companyCount > 0 ? `${companyCount}+` : ""
  const pageUrl = getCanonicalUrl(`/manufacturers/${stateMetadata.slug}`)

  return {
    title: `Contract Manufacturers in ${stateMetadata.name}${titleCountLabel ? ` | ${titleCountLabel} Verified Companies` : ""}`,
    description: `Find ${countLabel}verified contract manufacturers in ${stateMetadata.name}. Compare capabilities, certifications, and connect with local manufacturing partners.`,
    openGraph: {
      title: `${stateMetadata.name} Contract Manufacturers Directory`,
      description: `Browse verified contract manufacturers in ${stateMetadata.name}. Compare capabilities, certifications, and supplier experience.`,
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: `${stateMetadata.name} Contract Manufacturers Directory`,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
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
  const [{ state }, sp] = await Promise.all([params, searchParams])
  const urlFilters = parseFiltersFromSearchParams(sp)
  const stateMetadata = getStateMetadataBySlug(state)

  if (!stateMetadata) {
    notFound()
  }

  const initialFilters = {
    countries: urlFilters.countries.length > 0 ? urlFilters.countries : [],
    states:
      urlFilters.states.length > 0
        ? urlFilters.states
        : [stateMetadata.abbreviation],
    capabilities: urlFilters.capabilities,
    productionVolume: urlFilters.productionVolume,
    employeeCountRanges: urlFilters.employeeCountRanges,
    searchQuery: urlFilters.searchQuery,
  }

  const { data } = await supabase
    .from("companies")
    .select(`
      *,
      facilities!inner (
        country,
        country_code,
        state,
        state_code,
        state_province,
        city,
        latitude,
        longitude,
        facility_type,
        is_primary
      ),
      capabilities (*),
      certifications (certification_type),
      industries (industry_name)
    `)
    .eq("facilities.state_code", stateMetadata.abbreviation)
    .eq("is_active", true)

  const companies: Company[] = (data ?? []) as Company[]

  type CompanyWithTypedRelations = {
    facilities: Array<{ city: string | null }> | null
    capabilities: Array<{
      pcb_assembly_smt: boolean | null
      cable_harness_assembly: boolean | null
      box_build_assembly: boolean | null
    }> | null
    certifications: Array<{ certification_type: string | null }> | null
  }

  const certificationSet = new Set<string>()
  const capabilitySet = new Set<string>()
  const cityCounts = new Map<string, number>()

  companies.forEach((company) => {
    const typedCompany = company as unknown as CompanyWithTypedRelations

    typedCompany.certifications?.forEach((certification) => {
      const name = certification?.certification_type
      if (typeof name === "string" && name.length > 0) {
        certificationSet.add(name)
      }
    })

    typedCompany.capabilities?.forEach((capability) => {
      if (capability?.pcb_assembly_smt) {
        capabilitySet.add("SMT Assembly")
      }
      if (capability?.cable_harness_assembly) {
        capabilitySet.add("Cable Assembly")
      }
      if (capability?.box_build_assembly) {
        capabilitySet.add("Box Build")
      }
    })

    typedCompany.facilities?.forEach((facility) => {
      const city = facility?.city?.trim()
      if (!city) {
        return
      }

      cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1)
    })
  })

  const sortedCities = Array.from(cityCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]
      }

      return a[0].localeCompare(b[0])
    })
    .map(([city]) => city)

  const stats = {
    totalCompanies: companies.length,
    certifications: Array.from(certificationSet),
    capabilities: Array.from(capabilitySet),
    cities: sortedCities,
  }

  const highlightedCities = stats.cities.slice(0, 4)
  const highlightedCitiesDescription = formatCityList(highlightedCities)

  const heroDescriptionParts = [
    `Discover verified electronics manufacturing partners across ${stateMetadata.name}.`,
    highlightedCitiesDescription
      ? `Key hubs include ${highlightedCitiesDescription}.`
      : undefined,
  ].filter(Boolean) as string[]

  const heroDescription = heroDescriptionParts.join(" ")

  const overviewIntro =
    stats.totalCompanies > 0
      ? `${stateMetadata.name} is home to ${stats.totalCompanies} contract manufacturers serving diverse industries including aerospace, medical devices, automotive, and consumer electronics.`
      : `${stateMetadata.name} manufacturers support aerospace, medical device, automotive, and consumer electronics programs across the region.`

  const overviewParagraph = `${overviewIntro}${
    highlightedCitiesDescription
      ? ` Major manufacturing centers include ${highlightedCitiesDescription}.`
      : ""
  }`

  const canonicalUrl = getCanonicalUrl(`/manufacturers/${stateMetadata.slug}`)
  const manufacturersIndexUrl = getCanonicalUrl("/manufacturers")
  const homeUrl = getCanonicalUrl("/")

  const stateSchema = createCollectionPageJsonLd({
    name: `Contract Manufacturers in ${stateMetadata.name}`,
    description: heroDescription || undefined,
    url: canonicalUrl,
    numberOfItems: stats.totalCompanies,
    breadcrumbs: [
      { name: "Home", url: homeUrl },
      { name: "Manufacturers", url: manufacturersIndexUrl },
      { name: stateMetadata.name, url: canonicalUrl },
    ],
  })

  const relatedStates = getAllStateMetadata()
    .filter((metadata) => metadata.slug !== stateMetadata.slug)
    .slice(0, 8)

  return (
    <FilterProvider initialFilters={initialFilters}>
      <>
        <script {...jsonLdScriptProps(stateSchema)} />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/manufacturers" className="hover:text-white">Manufacturers</Link>
              <span>/</span>
              <span className="text-white">{stateMetadata.name}</span>
            </nav>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-semibold">
                {stateMetadata.abbreviation}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Contract Manufacturers in {stateMetadata.name}
                </h1>
                {heroDescription && (
                  <p className="text-xl text-blue-100 max-w-3xl">
                    {heroDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.totalCompanies}</div>
                <div className="text-sm text-blue-100">Verified Manufacturers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.cities.length}</div>
                <div className="text-sm text-blue-100">Cities Covered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.certifications.length}</div>
                <div className="text-sm text-blue-100">Certification Types</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.capabilities.length}</div>
                <div className="text-sm text-blue-100">Capabilities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* SEO Content Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Finding Contract Manufacturers in {stateMetadata.name}
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                {overviewParagraph}
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Key Manufacturing Capabilities</h3>
              <p>
                Contract manufacturers in {stateMetadata.name} offer a comprehensive range of services
                including PCB assembly, cable harness manufacturing, box build assembly, and full
                turnkey production. Many facilities maintain certifications such as ISO 9001,
                ISO 13485 for medical devices, and AS9100 for aerospace applications.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Industries Served</h3>
              <p>
                The state’s manufacturing sector supports critical industries with specialized requirements. From prototype development to high-volume production, {stateMetadata.name}’s contract manufacturers provide scalable solutions for companies of all sizes.
              </p>
            </div>

            {/* Popular Cities */}
            {stats.cities.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Manufacturing Hubs in {stateMetadata.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.cities.slice(0, 10).map((city) => (
                    <span
                      key={city}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Company Listings */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All Manufacturers in {stateMetadata.name}
            </h2>
            <p className="text-gray-600">
              Browse {stats.totalCompanies} verified contract manufacturers below
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar allCompanies={companies || []} />
            </div>
            <div className="lg:col-span-8">
              <CompanyList allCompanies={companies || []} />
            </div>
          </div>

          {/* Related States Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">Explore Other States</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedStates.map((metadata) => (
                <Link
                  key={metadata.slug}
                  href={`/manufacturers/${metadata.slug}`}
                  className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="font-semibold text-gray-900">{metadata.name}</div>
                  <div className="text-sm text-gray-500 mt-1">View manufacturers →</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
    </FilterProvider>
  )
}
