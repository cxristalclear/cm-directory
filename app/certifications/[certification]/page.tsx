import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import { FilterProvider } from "@/contexts/FilterContext"
import { fetchCompaniesStub } from "@/lib/companies/stubData"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import type { CompanyListItem } from "@/types/company"

type SearchParams = Record<string, string | string[] | undefined>

const CERTIFICATION_DATA: Record<string, {
  name: string
  dbName: string
  title: string
  description: string
  industry: string
}> = {
  "iso-9001": {
    name: "ISO 9001",
    dbName: "ISO 9001",
    title: "ISO 9001 Certified Manufacturers",
    description: "Quality management system certification for consistent product quality",
    industry: "General Manufacturing",
  },
  "iso-13485": {
    name: "ISO 13485",
    dbName: "ISO 13485",
    title: "ISO 13485 Medical Device Manufacturers",
    description: "Medical device quality management certification for regulatory compliance",
    industry: "Medical Devices",
  },
  as9100: {
    name: "AS9100",
    dbName: "AS9100",
    title: "AS9100 Aerospace Manufacturers",
    description: "Aerospace quality management certification for aviation and defense",
    industry: "Aerospace & Defense",
  },
  "iatf-16949": {
    name: "IATF 16949",
    dbName: "IATF 16949",
    title: "IATF 16949 Automotive Manufacturers",
    description: "Automotive quality management system for OEM suppliers",
    industry: "Automotive",
  },
  itar: {
    name: "ITAR Registered",
    dbName: "ITAR",
    title: "ITAR Registered Defense Manufacturers",
    description: "International Traffic in Arms Regulations compliance for defense articles",
    industry: "Defense",
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

export async function generateStaticParams() {
  return Object.keys(CERTIFICATION_DATA).map(certification => ({ certification }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certification: string }>
}): Promise<Metadata> {
  const { certification } = await params
  const certData = CERTIFICATION_DATA[certification]

  if (!certData) {
    return {
      title: "Certification Not Found | CM Directory",
      description: "The requested certification page could not be found.",
    }
  }

  return {
    title: certData.title,
    description: `Find ${certData.name} certified contract manufacturers. ${certData.description}. Browse verified manufacturers with active certifications.`,
    openGraph: {
      title: certData.title,
      description: certData.description,
      type: "website",
    },
    alternates: {
      canonical: `https://yourdomain.com/certifications/${certification}`,
    },
  }
}

export default async function CertificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string }>
  searchParams?: SearchParams
}) {
  const { certification } = await params
  const certData = CERTIFICATION_DATA[certification]

  if (!certData) {
    notFound()
  }

  const filters = parseFiltersFromSearchParams(toRecord(searchParams))
  const cursor = getCursor(searchParams)
  const predicate = (company: CompanyListItem) =>
    (company.certifications ?? []).some(
      certificationEntry =>
        certificationEntry?.certification_type?.toLowerCase() === certData.dbName.toLowerCase(),
    )

  const { companies, totalCount, pageInfo } = await fetchCompaniesStub(filters, cursor, predicate)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/certifications" className="hover:text-white">
              Certifications
            </Link>
            <span>/</span>
            <span className="text-white">{certData.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">{certData.name.split(" ")[0]}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-3">{certData.title}</h1>
              <p className="text-xl text-blue-100 max-w-3xl">{certData.description}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-2xl font-bold">{totalCount}</span>
              <span className="text-blue-100 ml-2">Certified Manufacturers</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-blue-100">Industry Focus:</span>
              <span className="text-white font-semibold ml-2">{certData.industry}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">About {certData.name} Certification</h2>
          <div className="prose max-w-none text-gray-700">
            <p>
              {certData.description}. This certification is essential for manufacturers serving the{' '}
              {certData.industry.toLowerCase()} sector.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3">
              Why Choose {certData.name} Certified Manufacturers?
            </h3>
            <p>
              Working with {certData.name} certified contract manufacturers ensures compliance with industry standards, quality consistency, and regulatory requirements.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">{certData.name} Certified Manufacturers</h2>

        <FilterProvider initialFilters={filters} initialFilteredCount={totalCount}>
          <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
        </FilterProvider>
      </div>
    </div>
  )
}
