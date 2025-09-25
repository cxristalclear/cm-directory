import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import Header from "@/components/Header"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"

const INDUSTRY_DATA: Record<
  string,
  {
    name: string
    dbName: string
    title: string
    description: string
    requirements: string[]
  }
> = {
  "medical-devices": {
    name: "Medical Devices",
    dbName: "Medical Devices",
    title: "Medical Device Contract Manufacturers",
    description: "FDA-compliant manufacturing for medical devices and diagnostic equipment",
    requirements: ["ISO 13485", "FDA Registration", "Clean Room", "Traceability"],
  },
  "aerospace-defense": {
    name: "Aerospace & Defense",
    dbName: "Aerospace/Defense",
    title: "Aerospace and Defense Manufacturers",
    description: "AS9100 certified manufacturing for aviation and defense applications",
    requirements: ["AS9100", "ITAR", "NADCAP", "First Article Inspection"],
  },
  automotive: {
    name: "Automotive",
    dbName: "Automotive",
    title: "Automotive Electronics Manufacturers",
    description: "IATF 16949 certified manufacturing for automotive electronics and components",
    requirements: ["IATF 16949", "PPAP", "APQP", "Automotive Grade Components"],
  },
  "industrial-controls": {
    name: "Industrial Controls",
    dbName: "Industrial Controls",
    title: "Industrial Control System Manufacturers",
    description: "Rugged electronics manufacturing for industrial automation and control systems",
    requirements: ["UL Certification", "Conformal Coating", "Extended Temperature", "Vibration Testing"],
  },
  "consumer-electronics": {
    name: "Consumer Electronics",
    dbName: "Consumer Electronics",
    title: "Consumer Electronics Contract Manufacturers",
    description: "High-volume manufacturing for consumer electronic products",
    requirements: ["RoHS Compliant", "FCC Certification", "High Volume", "Cost Optimization"],
  },
}

export async function generateStaticParams() {
  return Object.keys(INDUSTRY_DATA).map((industry) => ({ industry }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>
}): Promise<Metadata> {
  const { industry } = await params
  const industryData = INDUSTRY_DATA[industry]

  if (!industryData) {
    return {
      title: "Industry Not Found | CM Directory",
      description: "The requested industry page could not be found.",
    }
  }

  return {
    title: `${industryData.title} | Specialized Manufacturing Partners`,
    description: `Find contract manufacturers specializing in ${industryData.name.toLowerCase()}. ${industryData.description}`,
    openGraph: {
      title: industryData.title,
      description: industryData.description,
      type: "website",
    },
    alternates: {
      canonical: `https://yourdomain.com/industries/${industry}`,
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
  const [{ industry }, resolvedSearch] = await Promise.all([params, searchParams])
  const industryData = INDUSTRY_DATA[industry]

  if (!industryData) {
    notFound()
  }

  const filters = parseFiltersFromSearchParams(resolvedSearch)

  const { data: companies } = await supabase
    .from("companies")
    .select(
      `
      id,
      company_name,
      slug,
      dba_name,
      description,
      employee_count_range,
      website_url,
      annual_revenue_range,
      facilities:facilities (
        id,
        facility_type,
        street_address,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        is_primary
      ),
      capabilities:capabilities (
        id,
        pcb_assembly_smt,
        pcb_assembly_through_hole,
        pcb_assembly_mixed,
        pcb_assembly_fine_pitch,
        cable_harness_assembly,
        box_build_assembly,
        prototyping,
        low_volume_production,
        medium_volume_production,
        high_volume_production
      ),
      industries:industries!inner (
        id,
        industry_name
      ),
      certifications:certifications (
        id,
        certification_type
      )
    `,
    )
    .eq("industries.industry_name", industryData.dbName)
    .eq("is_active", true)

  const listingCompanies = sanitizeCompaniesForListing((companies as Company[] | null) ?? [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        totalCount={listingCompanies.length}
        visibleCount={listingCompanies.length}
        activeFilterCount={filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)}
        clearHref={`/industries/${industry}`}
      />

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/industries" className="hover:text-white">
              Industries
            </Link>
            <span>/</span>
            <span className="text-white">{industryData.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-semibold">
              {industryData.name.split(" ")[0]}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-3">{industryData.title}</h1>
              <p className="text-xl text-blue-100 max-w-3xl">{industryData.description}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
              <span className="text-2xl font-bold">{listingCompanies.length}</span>
              <span className="text-blue-100 ml-2">Specialized Manufacturers</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">{industryData.name} Manufacturing Requirements</h2>
          <div className="prose max-w-none text-gray-700">
            <p>Contract manufacturers serving the {industryData.name.toLowerCase()} industry must meet specific regulatory and quality requirements.</p>
            <h3 className="text-lg font-semibold mt-6 mb-3">Key Requirements</h3>
            <ul>
              {industryData.requirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">{industryData.name} Manufacturers</h2>
          <CompanyList
            companies={listingCompanies}
            totalCount={listingCompanies.length}
            hasNext={false}
            hasPrev={false}
            nextCursor={null}
            prevCursor={null}
          />
        </section>
      </main>
    </div>
  )
}
