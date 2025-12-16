import Link from "next/link"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"
import Navbar from "@/components/navbar"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps } from "@/lib/schema"
import { stateSlugFromAbbreviation } from "@/lib/states"
import { supabase } from "@/lib/supabase"

const pageUrl = getCanonicalUrl("/manufacturers")
const pageTitle = "Contract Manufacturers by State | Browse All Locations"
const pageDescription =
  "Find contract manufacturers across the United States. Browse by state to find local manufacturing partners with the capabilities and certifications you need."

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
    siteName: siteConfig.name,
  },
}

export default async function ManufacturersIndexPage() {
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

  const itemListSchema = {
    "@context": "https://schema.org" as const,
    "@type": "ItemList",
    name: "Contract Manufacturers by State",
    url: pageUrl,
    itemListElement: stateEntries.slice(0, 100).map(([state, count], index) => {
      const slug = stateSlugFromAbbreviation(state) ?? state.toLowerCase()
      return {
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(`/manufacturers/${slug}`),
        name: `Contract manufacturers in ${state}`,
        ...(count ? { description: `${count} manufacturers` } : {}),
      }
    }),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <script {...jsonLdScriptProps(itemListSchema)} />

        <h1 className="text-4xl font-bold mb-4">Contract Manufacturers by State</h1>
        <p className="text-xl text-gray-600 mb-8">
          Browse our directory of verified contract manufacturers organized by location
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stateEntries.map(([state, count]) => {
            const slug = stateSlugFromAbbreviation(state) ?? state.toLowerCase()
            return (
              <Link
                key={state}
                href={`/manufacturers/${slug}`}
                className="bg-white p-4 rounded-lg border hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{state}</h3>
                    <p className="text-sm text-gray-500">{count} manufacturers</p>
                  </div>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
