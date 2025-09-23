import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import { FilterProvider } from "@/contexts/FilterContext"
import { fetchCompaniesStub } from "@/lib/companies/stubData"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import type { CompanyListItem } from "@/types/company"
import { getStateName } from "@/utils/stateMapping"

type SearchParams = Record<string, string | string[] | undefined>

const STATE_DATA: Record<string, {
  name: string
  fullName: string
  description: string
  majorCities: string[]
}> = {
  california: {
    name: "California",
    fullName: "California",
    description: "Silicon Valley and Southern California host advanced electronics and medical device manufacturers",
    majorCities: ["Los Angeles", "San Diego", "San Jose", "San Francisco"],
  },
  texas: {
    name: "Texas",
    fullName: "Texas",
    description: "Major manufacturing hub with aerospace, defense, and energy sector specializations",
    majorCities: ["Houston", "Dallas", "Austin", "San Antonio"],
  },
  ohio: {
    name: "Ohio",
    fullName: "Ohio",
    description: "Traditional manufacturing powerhouse with automotive and industrial expertise",
    majorCities: ["Columbus", "Cleveland", "Cincinnati", "Dayton"],
  },
  michigan: {
    name: "Michigan",
    fullName: "Michigan",
    description: "Automotive manufacturing capital with growing medical device and aerospace sectors",
    majorCities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights"],
  },
}

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

  return value.length > 0 ? value[0] : null
}

export async function generateMetadata({
  params,
}: {
  params: { state: string }
}): Promise<Metadata> {
  const { state } = params
  const stateData = STATE_DATA[state.toLowerCase()]

  if (!stateData) {
    return {
      title: "State Not Found | CM Directory",
      description: "The requested state page could not be found.",
    }
  }

  return {
    title: `Contract Manufacturers in ${stateData.fullName} | Verified Companies`,
    description: `Find verified contract manufacturers in ${stateData.fullName}. ${stateData.description}. Compare capabilities, certifications, and get quotes from local manufacturing partners.`,
    openGraph: {
      title: `${stateData.fullName} Contract Manufacturers Directory`,
      description: `Browse verified contract manufacturers in ${stateData.fullName}. ${stateData.description}`,
      type: "website",
    },
    alternates: {
      canonical: `https://yourdomain.com/manufacturers/${state}`,
    },
  }
}

export default async function StateManufacturersPage({
  params,
  searchParams,
}: {
  params: { state: string }
  searchParams?: SearchParams
}) {
  const { state } = params
  const stateKey = state.toLowerCase()
  const stateData = STATE_DATA[stateKey]

  if (!stateData) {
    notFound()
  }

  const filters = parseFiltersFromSearchParams(toRecord(searchParams))
  const cursor = getCursor(searchParams)
  const predicate = (company: CompanyListItem) =>
    (company.facilities ?? []).some(
      facility => facility?.state?.toLowerCase() === stateData.name.toLowerCase(),
    )

  const { companies, totalCount, pageInfo } = await fetchCompaniesStub(filters, cursor, predicate)

  const summaryCities = stateData.majorCities.slice(0, 3).join(", ")
  const trailingCity = stateData.majorCities[3]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/manufacturers" className="hover:text-white">
              Manufacturers
            </Link>
            <span>/</span>
            <span className="text-white">{stateData.fullName}</span>
          </nav>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">{stateData.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-3">Contract Manufacturers in {stateData.fullName}</h1>
              <p className="text-xl text-blue-100 max-w-3xl">{stateData.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{totalCount}</div>
              <div className="text-sm text-blue-100">Verified Manufacturers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{stateData.majorCities.length}</div>
              <div className="text-sm text-blue-100">Cities Covered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{getStateName(stateData.name).length}</div>
              <div className="text-sm text-blue-100">State Code Length</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{companies.length}</div>
              <div className="text-sm text-blue-100">On This Page</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Finding Contract Manufacturers in {stateData.fullName}</h2>
          <div className="prose max-w-none text-gray-700">
            <p>
              {stateData.fullName} is home to {totalCount} contract manufacturers serving diverse industries including aerospace, medical devices, automotive, and consumer electronics. Major manufacturing centers include {summaryCities}, and {trailingCity}.
            </p>
          </div>
        </div>

        <FilterProvider initialFilters={filters} initialFilteredCount={totalCount}>
          <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
        </FilterProvider>
      </div>
    </div>
  )
}
