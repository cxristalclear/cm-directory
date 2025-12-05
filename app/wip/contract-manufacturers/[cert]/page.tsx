// app/contract-manufacturers/[cert]/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import CompanyList from "@/components/CompanyList"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"

/**
* Fetches active companies and their related facilities, capabilities, certifications, and industries from Supabase.
* @example
* getCompanies()
* [
*   {
*     id: 'uuid',
*     name: 'Acme Corp',
*     facilities: [{ /* facility objects */
async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      facilities(*),
      capabilities(*),
      certifications(*),
      industries(*)
    `)
    .eq("is_active", true);
  if (error || !data) return [];
  return data as Company[];
}

function normalizeCertParam(param: string) {
  // map dashed route to human-readable (e.g., iso-13485 -> ISO 13485)
  return param.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
* Generate metadata for the contract manufacturers page using the `cert` route parameter.
* @example
* generateMetadata({ params: Promise.resolve({ cert: 'iso9001' }) })
* { title: "ISO9001 Contract Manufacturers | ExampleSite", description: "Browse verified electronics manufacturers with ISO9001. Compare capabilities (SMT, Through-Hole, Box Build) and locations.", alternates: "https://example.com/contract-manufacturers/iso9001", openGraph: { title: "...", description: "...", url: "...", type: "website", siteName: "ExampleSite", images: ["..."] }, twitter: { card: "summary_large_image", title: "...", description: "...", images: ["..."] } }
* @param {{Promise<{ cert: string }>} } {{params}} - Object containing a promise that resolves to an object with a `cert` string.
* @returns {{Promise<Metadata>}} Promise resolving to the metadata object for the page.
**/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cert: string }>
}): Promise<Metadata> {
  const { cert } = await params
  const certNice = normalizeCertParam(cert)
  const title = `${certNice} Contract Manufacturers | ${siteConfig.name}`
  const description = `Browse verified electronics manufacturers with ${certNice}. Compare capabilities (SMT, Through-Hole, Box Build) and locations.`
  const canonical = getCanonicalUrl(`/contract-manufacturers/${cert}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: siteConfig.name,
      images: [siteConfig.ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [siteConfig.ogImage] },
  };
}

/**
 * Render a contract manufacturers page filtered by a certification route parameter and optional search params.
 * @example
 * CertManufacturers({ params: Promise.resolve({ cert: 'ISO13485' }), searchParams: Promise.resolve({ region: 'US' }) })
 * // returns Promise resolving to a JSX.Element representing the manufacturers listing page
 * @param {Promise<{ cert: string }>} params - Promise resolving to route params object containing the "cert" string.
 * @param {Promise<Record<string, string | string[] | undefined>>} searchParams - Promise resolving to URL search parameters.
 * @returns {Promise<JSX.Element>} Promise that resolves to a JSX.Element rendering the filtered manufacturers page.
 */
export default async function CertManufacturers({
  params,
  searchParams,
}: {
  params: Promise<{ cert: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ cert }, sp] = await Promise.all([params, searchParams])
  const initialFilters = parseFiltersFromSearchParams(sp)
  const companies = await getCompanies();
  const certNice = normalizeCertParam(cert);
  const certLower = certNice.toLowerCase();

  const byCert = companies.filter((company) =>
    (company.certifications ?? []).some(
      (certification) =>
        typeof certification?.certification_type === "string" &&
        certification.certification_type.toLowerCase() === certLower,
    ),
  );

  const canonicalUrl = getCanonicalUrl(`/contract-manufacturers/${cert}`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certNice} Contract Manufacturers`,
    url: canonicalUrl,
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

        <FilterProvider initialFilters={initialFilters}>
          <div className="companies-directory">
            <CompanyList allCompanies={byCert} />
          </div>
        </FilterProvider>
      </main>
    </div>
  );
}
