import Link from "next/link"
import type { Metadata } from "next"
import { CAPABILITY_DEFINITIONS } from "@/lib/capabilities"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { supabase } from "@/lib/supabase"

async function fetchCapabilityCounts(): Promise<Record<string, number>> {
  const counts = await Promise.all(
    CAPABILITY_DEFINITIONS.map(async definition => {
      let query = supabase
        .from("companies")
        .select("id, capabilities!inner (id)", { count: "exact", head: true })
        .eq("is_active", true)

      for (const filter of definition.supabaseFilters) {
        query = query.eq(`capabilities.${filter.column}`, filter.value)
      }

      const { count, error } = await query
      if (error) {
        console.error(`Error fetching count for ${definition.slug}:`, error)
        return [definition.slug, 0] as const
      }
      return [definition.slug, count ?? 0] as const
    }),
  )

  return Object.fromEntries(counts)
}
export async function generateMetadata(): Promise<Metadata> {
  const pageUrl = getCanonicalUrl("/capabilities")
  const siteName = siteConfig.name

  return {
    title: `Manufacturing Capabilities Directory | ${siteName}`,
    description:
      "Browse electronics manufacturing capabilities including SMT assembly, through-hole, cable harness, box build, and prototyping services.",
    openGraph: {
      title: "Manufacturing Capabilities Directory",
      description:
        "Compare contract manufacturers by SMT, through-hole, cable harness, box build, and prototyping capabilities.",
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: "Manufacturing capabilities",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Manufacturing Capabilities Directory",
      description:
        "Explore verified EMS partners by SMT, through-hole, cable harness, box build, and prototyping services.",
      images: [
        {
          url: siteConfig.ogImage,
          alt: "Manufacturing capabilities",
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function CapabilitiesIndexPage() {
  const counts = await fetchCapabilityCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold">Browse by Manufacturing Capability</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Select a capability to see verified EMS partners, evaluation criteria, and sourcing guidance tailored to that
            service.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {CAPABILITY_DEFINITIONS.map(definition => (
            <Link
              key={definition.slug}
              href={`/capabilities/${definition.slug}`}
              className="group flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">{definition.name}</h2>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-blue-600">
                  {counts[definition.slug] ?? 0} suppliers
                </p>
                <p className="mt-4 text-gray-600">{definition.summary}</p>
              </div>
              <p className="mt-6 text-sm text-gray-500">{definition.heroHighlight}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
