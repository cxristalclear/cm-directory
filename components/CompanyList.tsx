import Link from "next/link"
import { Building2, MapPin } from "lucide-react"

import Pagination from "@/components/Pagination"
import type { CompanyPageInfo } from "@/lib/queries/companySearch"
import type { ListingCapability, ListingCompany, ListingFacility } from "@/types/company"

type CompanyListProps = {
  companies: ListingCompany[]
  filteredCount: number
  pageInfo: CompanyPageInfo
}

const CAPABILITY_BADGE_LABELS: Record<string, string> = {
  smt: "SMT",
  through_hole: "Through-Hole",
  mixed: "Mixed Tech",
  fine_pitch: "Fine Pitch",
  box_build: "Box Build",
  cable_harness: "Cable Harness",
  prototyping: "Prototyping",
}

function primaryFacility(company: ListingCompany): ListingFacility | null {
  const facilities = company.facilities ?? []
  const prioritized = facilities.find((facility) => facility?.is_primary)
  if (prioritized) {
    return prioritized
  }
  return facilities[0] ?? null
}

function buildBadges(capability: ListingCapability | undefined): Array<{ id: string; label: string }> {
  if (!capability) {
    return []
  }

  const badges: Array<{ id: string; label: string }> = []

  const featureMap: Array<[keyof ListingCapability, string, string]> = [
    ["pcb_assembly_smt", "smt", CAPABILITY_BADGE_LABELS.smt],
    ["pcb_assembly_through_hole", "through_hole", CAPABILITY_BADGE_LABELS.through_hole],
    ["pcb_assembly_mixed", "mixed", CAPABILITY_BADGE_LABELS.mixed],
    ["pcb_assembly_fine_pitch", "fine_pitch", CAPABILITY_BADGE_LABELS.fine_pitch],
    ["box_build_assembly", "box_build", CAPABILITY_BADGE_LABELS.box_build],
    ["cable_harness_assembly", "cable_harness", CAPABILITY_BADGE_LABELS.cable_harness],
    ["prototyping", "prototyping", CAPABILITY_BADGE_LABELS.prototyping],
  ]

  for (const [field, id, label] of featureMap) {
    if (capability[field]) {
      badges.push({ id, label })
    }
  }

  return badges.slice(0, 5)
}

function formatLocation(facility: ListingFacility | null): string {
  if (!facility) {
    return "Multiple locations"
  }
  if (facility.city && facility.state) {
    return `${facility.city}, ${facility.state}`
  }
  if (facility.state) {
    return facility.state
  }
  return "Location unavailable"
}

export default function CompanyList({ companies, filteredCount, pageInfo }: CompanyListProps) {
  const paginationNeeded = pageInfo.hasNextPage || pageInfo.hasPreviousPage

  if (companies.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
        <Building2 className="mb-4 inline h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-600">No companies found</h3>
        <p className="mx-auto max-w-md text-sm text-gray-500">
          Adjust your filters or clear them to explore additional manufacturing partners.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Companies Directory</h2>
        <span className="text-sm font-medium text-gray-600">
          Showing {companies.length} of {filteredCount} results
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => {
          const facility = primaryFacility(company)
          const capability = company.capabilities?.[0]
          const badges = buildBadges(capability)

          return (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="group block overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm transition hover:border-blue-200/50 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 transition group-hover:scale-105">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {company.company_name}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wide text-green-600">Verified vendor</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                    <MapPin className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Primary location</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{formatLocation(facility)}</p>
                  </div>
                </div>

                {badges.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Highlighted capabilities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {badges.map((badge) => (
                        <span
                          key={`${company.id}-${badge.id}`}
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {paginationNeeded && <Pagination pageInfo={pageInfo} />}
    </div>
  )
}
