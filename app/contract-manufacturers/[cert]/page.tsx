// app/contract-manufacturers/[cert]/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companySearch } from "@/lib/queries/companySearch"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"


function normalizeCertParam(param: string) {
  // map dashed route to human-readable (e.g., iso-13485 -> ISO 13485)
  return param.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cert: string }>
}): Promise<Metadata> {
  const { cert } = await params
  const certNice = normalizeCertParam(cert)
  const title = `${certNice} Contract Manufacturers | CM Directory`;
  const description = `Browse verified electronics manufacturers with ${certNice}. Compare capabilities (SMT, Through-Hole, Box Build) and locations.`;
  const canonical = `https://www.example.com/contract-manufacturers/${cert}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CertManufacturers({
  params,
  searchParams,
}: {
  params: Promise<{ cert: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ cert }, sp] = await Promise.all([params, searchParams])
  const filters = parseFiltersFromSearchParams(sp)
  const cursor = parseCursor(sp)
  const searchResult = await companySearch({
    filters,
    routeDefaults: { certSlug: cert },
    cursor,
  })
  
  const companies = sanitizeCompaniesForListing(searchResult.companies)
  const certNice = normalizeCertParam(cert);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certNice} Contract Manufacturers`,
    url: `https://www.example.com/contract-manufacturers/${cert}`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="cert-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/pcb-assembly-manufacturers" className="underline">PCB Assembly</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">{certNice}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-1">{certNice} Contract Manufacturers</h1>
        <p className="text-gray-600 mb-4">Medical, aerospace, and regulated industries often require {certNice}. Compare verified partners and contact directly.</p>

        <FilterProvider initialFilters={filters}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar facetCounts={facetCounts ?? undefined} />
            </div>
            <div className="lg:col-span-8">
              <CompanyList companies={companies} totalCount={totalCount} pageInfo={pageInfo} />
            </div>
          </div>
        </FilterProvider>
      </main>
    </div>
  );
}
