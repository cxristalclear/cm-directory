import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { MapPin } from "lucide-react"
import Navbar from "@/components/navbar"
import Pagination from "@/components/Pagination"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps } from "@/lib/schema"
import { stateSlugFromAbbreviation } from "@/lib/states"
import { supabase } from "@/lib/supabase"

const ITEMS_PER_PAGE = 12
const baseUrl = "/manufacturers"
const pageTitle = "Contract Manufacturers by State | Browse All Locations"
const pageDescription =
  "Find contract manufacturers across the United States. Browse by state to find local manufacturing partners with the capabilities and certifications you need."

/**
 * Generate metadata with pagination support (prev/next links and canonical URLs)
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const page = parseInt(
    (Array.isArray(params.page) ? params.page[0] : params.page) || "1",
    10
  )

  // Redirect page 1 to base URL (SEO best practice)
  if (page === 1) {
    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: getCanonicalUrl(baseUrl),
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: getCanonicalUrl(baseUrl),
        siteName: siteConfig.name,
      },
    }
  }

  const currentUrl = getCanonicalUrl(`${baseUrl}?page=${page}`)
  const prevUrl = page === 2 
    ? getCanonicalUrl(baseUrl)
    : getCanonicalUrl(`${baseUrl}?page=${page - 1}`)
  const nextUrl = getCanonicalUrl(`${baseUrl}?page=${page + 1}`)

  // Get total pages for next link
  const { data: stateCounts } = await supabase
    .from('facilities')
    .select('state, state_code')
  
  const stateStats = stateCounts?.reduce((acc, facility) => {
    const stateValue = facility.state_code || facility.state
    if (stateValue) {
      acc[stateValue] = (acc[stateValue] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}
  
  const totalStates = Object.entries(stateStats)
    .filter(([, count]) => count > 0)
    .length
  
  const totalPages = totalStates > 0 ? Math.ceil(totalStates / ITEMS_PER_PAGE) : 1

  return {
    title: `${pageTitle} - Page ${page}`,
    description: pageDescription,
    alternates: {
      canonical: currentUrl,
      ...(page > 1 && { prev: prevUrl }),
      ...(page < totalPages && totalPages > 1 && { next: nextUrl }),
    },
    openGraph: {
      title: `${pageTitle} - Page ${page}`,
      description: pageDescription,
      url: currentUrl,
      siteName: siteConfig.name,
    },
  }
}

export default async function ManufacturersIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page
  const page = parseInt(pageParam || "1", 10)

  // Redirect page 1 to base URL (SEO best practice - avoid duplicate content)
  if (page === 1 && pageParam) {
    redirect(baseUrl)
  }

  // Validate page number
  if (page < 1 || isNaN(page)) {
    redirect(baseUrl)
  }

  // Get counts by state - query both state_code and state to handle migration
  const { data: stateCounts } = await supabase
    .from('facilities')
    .select('state, state_code')
  
  const stateStats = stateCounts?.reduce((acc, facility) => {
    // Prioritize state_code (newer field) with fallback to state during migration
    const stateValue = facility.state_code || facility.state
    if (stateValue) {
      acc[stateValue] = (acc[stateValue] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}
  
  const stateEntries = Object.entries(stateStats)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))

  const totalStates = stateEntries.length
  const totalPages = totalStates > 0 ? Math.ceil(totalStates / ITEMS_PER_PAGE) : 1

  // Validate page is not beyond total pages
  if (totalPages > 0 && page > totalPages) {
    redirect(`${baseUrl}?page=${totalPages}`)
  }

  // Calculate pagination
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedStates = stateEntries.slice(startIndex, endIndex)

  // Build current page URL for schema
  const currentPageUrl = page === 1 
    ? getCanonicalUrl(baseUrl)
    : getCanonicalUrl(`${baseUrl}?page=${page}`)

  // ItemList schema - only include items on current page (SEO best practice)
  const itemListSchema = {
    "@context": "https://schema.org" as const,
    "@type": "ItemList",
    name: "Contract Manufacturers by State",
    url: currentPageUrl,
    numberOfItems: totalStates,
    itemListElement: paginatedStates.map(([state, count], index) => {
      const slug = stateSlugFromAbbreviation(state) ?? state.toLowerCase()
      return {
        "@type": "ListItem",
        position: startIndex + index + 1,
        url: getCanonicalUrl(`/manufacturers/${slug}`),
        name: `Contract manufacturers in ${state}`,
        ...(count ? { description: `${count} manufacturers` } : {}),
      }
    }),
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-container section">
        <script {...jsonLdScriptProps(itemListSchema)} />

        <h1 className="heading-xl mb-4">Contract Manufacturers by State</h1>
        <p className="text-xl text-gray-600 mb-8">
          Browse our directory of verified contract manufacturers organized by location
        </p>
        
        {paginatedStates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {paginatedStates.map(([state, count]) => {
                const slug = stateSlugFromAbbreviation(state) ?? state.toLowerCase()
                return (
                  <Link
                    key={state}
                    href={`/manufacturers/${slug}`}
                    className="card p-4 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="heading-sm">{state}</h3>
                        <p className="text-sm text-gray-500">{count} manufacturers</p>
                      </div>
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
                className="mt-8"
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No manufacturers found.</p>
          </div>
        )}
      </main>
    </div>
  )
}
