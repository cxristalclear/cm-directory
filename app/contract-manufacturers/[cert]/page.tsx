import Script from "next/script"
import Link from "next/link"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import { FilterProvider } from "@/contexts/FilterContext"
import { fetchCompaniesStub } from "@/lib/companies/stubData"
import {
  parseFiltersFromSearchParams,
  resolveURLSearchParams,
  type SearchParamsInput,
} from "@/lib/filters/url"
import type { CompanyListItem } from "@/types/company"

const CERT_TITLE_MAP: Record<string, string> = {
  "iso-13485": "ISO 13485",
  "as9100": "AS9100",
  "itar": "ITAR",
  "iso-9001": "ISO 9001",
  "iatf-16949": "IATF 16949",
}

function normalizeCertParam(param: string) {
  return param.replace(/-/g, " ").replace(/\b\w/g, match => match.toUpperCase())
}

export async function generateMetadata({ params }: { params: { cert: string } }): Promise<Metadata> {
  const certSlug = params.cert
  const displayName = CERT_TITLE_MAP[certSlug] ?? normalizeCertParam(certSlug)
  const title = `${displayName} Contract Manufacturers | CM Directory`
  const description = `Browse verified electronics manufacturers with ${displayName}. Compare capabilities and locations.`
  const canonical = `https://www.example.com/contract-manufacturers/${certSlug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function CertManufacturers({
  params,
  searchParams,
}: {
  params: { cert: string }
  searchParams?: SearchParamsInput
}) {
  const certSlug = params.cert
  const displayName = normalizeCertParam(certSlug)
  const paramsForFilters = await resolveURLSearchParams(searchParams)
  const filters = parseFiltersFromSearchParams(paramsForFilters)
  const cursor = paramsForFilters.get("cursor")
  const predicate = (company: CompanyListItem) =>
    (company.certifications ?? []).some(cert =>
      typeof cert?.certification_type === "string" &&
      cert.certification_type.toLowerCase() === displayName.toLowerCase(),
    )

  const { companies, totalCount, pageInfo } = await fetchCompaniesStub(filters, cursor, predicate)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${displayName} Contract Manufacturers`,
    url: `https://www.example.com/contract-manufacturers/${certSlug}`,
    numberOfItems: totalCount,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="cert-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-6">
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
              {displayName}
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-1">{displayName} Contract Manufacturers</h1>
        <p className="text-gray-600 mb-4">
          Medical, aerospace, and regulated industries often require {displayName}. Compare verified partners and contact directly.
        </p>

        <FilterProvider initialFilters={filters} initialFilteredCount={totalCount}>
          <div className="companies-directory">
            <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
          </div>
        </FilterProvider>
      </main>
    </div>
  )
}
