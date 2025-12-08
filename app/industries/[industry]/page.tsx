import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { FilterProvider } from "@/contexts/FilterContext"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import {
  createCollectionPageJsonLd,
  jsonLdScriptProps,
} from "@/lib/schema"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"
import {
  getIndustryBySlug,
  getIndustrySlugs,
  getRelatedIndustries,
  type IndustrySlug,
} from "@/lib/industries"

const siteName = siteConfig.name

export async function generateStaticParams() {
  return getIndustrySlugs().map(industry => ({
    industry,
  }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ industry: string }>
}): Promise<Metadata> {
  const { industry } = await params
  const industryData = getIndustryBySlug(industry)

  if (!industryData) {
    return {
      title: `Industry Not Found | ${siteName}`,
      description: 'The requested industry page could not be found.'
    }
  }

  const pageUrl = getCanonicalUrl(`/industries/${industry}`)

  return {
    title: `${industryData.title} | Specialized Manufacturing Partners`,
    description: `Find contract manufacturers specializing in ${industryData.name.toLowerCase()}. ${industryData.description}`,
    openGraph: {
      title: industryData.title,
      description: industryData.description,
      type: 'website',
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: industryData.title,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function IndustryPage({
  params,
  searchParams,
}: {
  params: Promise<{ industry: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ industry }, sp] = await Promise.all([params, searchParams])
  const initialFilters = parseFiltersFromSearchParams(sp)
  const industryData = getIndustryBySlug(industry)

  if (!industryData) {
    notFound()
  }

  // Fetch companies in this industry
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      *,
      industries!inner (*),
      capabilities (*),
      certifications (*),
      facilities (*)
    `)
    .eq('industries.industry_name', industryData.dbName)
    .eq('is_active', true)

  const typedCompanies = companies as Company[] | null

  const canonicalUrl = getCanonicalUrl(`/industries/${industry}`)
  const breadcrumbBaseUrl = getCanonicalUrl("/industries")
  const relatedIndustries = getRelatedIndustries(industryData.slug as IndustrySlug)
  const industrySchema = createCollectionPageJsonLd({
    name: industryData.title,
    description: industryData.description,
    url: canonicalUrl,
    numberOfItems: typedCompanies?.length ?? 0,
    breadcrumbs: [
      { name: "Home", url: getCanonicalUrl("/") },
      { name: "Industries", url: breadcrumbBaseUrl },
      { name: industryData.name, url: canonicalUrl },
    ],
  })

  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <script {...jsonLdScriptProps(industrySchema)} />
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <Breadcrumbs
              className="mb-6 text-blue-100"
              items={[
                { name: "Home", url: "/" },
                { name: "Industries", url: "/industries" },
                { name: industryData.name, url: canonicalUrl },
              ]}
            />

            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 text-md font-semibold backdrop-blur-sm">
                {industryData.name.split(" ")[0]}
              </div>
              <div>
                <h1 className="mb-3 text-4xl font-bold">{industryData.title}</h1>
                <p className="max-w-3xl text-xl text-blue-100">{industryData.description}</p>
                <div className="mt-6 inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2 text-sm text-blue-100">
                  <span className="text-2xl font-bold text-white">{typedCompanies?.length || 0}</span>
                  <span>Specialized Manufacturers</span>
                </div>
                <div className="mt-6">
                  <Link
                    href="/industries"
                    className="inline-flex items-center text-sm font-medium text-blue-100 transition hover:text-white"
                  >
                    ← View all industries
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* SEO Content */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">{industryData.name} Manufacturing Requirements</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                Contract manufacturers serving the {industryData.name.toLowerCase()} industry must meet specific regulatory and quality requirements.
              </p>
              <h3 className="mt-6 text-lg font-semibold">Key Requirements</h3>
              <ul>
                {industryData.requirements.map(req => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Listings */}
          <h2 className="text-2xl font-bold mb-6">{industryData.name} Manufacturers</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar allCompanies={typedCompanies || []} />
            </div>
            <div className="lg:col-span-8">
              <CompanyList allCompanies={typedCompanies || []} />
            </div>
          </div>

          {/* Related industries */}
          {relatedIndustries.length > 0 && (
            <div className="mt-12 rounded-xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Explore related industries</h3>
              <p className="mt-2 text-sm text-gray-600">
                Expand your search with adjacent manufacturing specializations.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {relatedIndustries.map(related => (
                  <Link
                    key={related.slug}
                    href={`/industries/${related.slug}`}
                    className="group rounded-lg border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                      {related.name}
                    </span>
                    <p className="mt-2 text-sm text-gray-600">{related.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FilterProvider>
  )
}
