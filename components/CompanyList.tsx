"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useFilters } from "../contexts/FilterContext";
import { MapPin, Users, Award, ChevronRight, Building2, Globe } from "lucide-react";
import type { Company } from "../types/company";
// import { getStateName } from '../utils/stateMapping'
import Pagination from "./Pagination";
import React from "react";
import ActiveFiltersBar from "../components/ActiveFiltersBar";

interface CompanyListProps {
  allCompanies: Company[];
}

/** Clamp text to N lines without relying on Tailwind’s line-clamp plugin */
function ClampText({
  children,
  lines = 3,
  className = "",
}: {
  children: React.ReactNode;
  lines?: number;
  className?: string;
}) {
  const style: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
}

function CapabilityChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}

export default function CompanyList({ allCompanies }: CompanyListProps) {
  const { filters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredCompanies = useMemo(() => {
    let filtered = [...allCompanies];

    // Apply same filtering logic as map
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.company_name?.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter((company) =>
        company.facilities?.some((f) => filters.countries.includes(f.country || "US")),
      );
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter((company) => company.facilities?.some((f) => filters.states.includes(f.state)));
    }

    if (filters.capabilities.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false;
        const cap = company.capabilities[0];
        return filters.capabilities.some((filter) => {
          switch (filter) {
            case "smt":
              return cap.pcb_assembly_smt;
            case "through_hole":
              return cap.pcb_assembly_through_hole;
            case "cable_harness":
              return cap.cable_harness_assembly;
            case "box_build":
              return cap.box_build_assembly;
            case "prototyping":
              return cap.prototyping;
            default:
              return false;
          }
        });
      });
    }

    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false;
        const cap = company.capabilities[0];
        return filters.volumeCapability.some((vol) => {
          switch (vol) {
            case "low":
              return cap.low_volume_production;
            case "medium":
              return cap.medium_volume_production;
            case "high":
              return cap.high_volume_production;
            default:
              return false;
          }
        });
      });
    }

    // Certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter((company) =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(cert.certification_type.toLowerCase().replace(/\s+/g, "_")),
        ),
      );
    }

    // Industries filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries?.some((ind) =>
          filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, "_")),
        ),
      );
    }

    // Employee range filter
    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter((company) => filters.employeeRange.includes(company.employee_count_range));
    }

    return filtered;
  }, [filters, allCompanies]);

  const facilityCount = useMemo(() => {
    return filteredCompanies.reduce(
      (acc, company) => acc + (company.facilities?.filter((f) => f.latitude && f.longitude).length || 0),
      0,
    );
  }, [filteredCompanies]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCompanies.slice(startIndex, endIndex);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  return (
    <div className="space-y-1">
      {/* List Header */}
      <div className="flex items-center justify-between p-2">
        <div className="mb-4">
          <ActiveFiltersBar />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{allCompanies.length}</span> companies
            {facilityCount !== filteredCompanies.length && (
              <span className="text-gray-500"> ({facilityCount} locations)</span>
            )}
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900">No companies match your criteria</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          paginatedCompanies.map((company) => {
            const locationCity = company.facilities?.[0]?.city;
            const locationState = company.facilities?.[0]?.state;
            const location =
              locationCity && locationState ? `${locationCity}, ${locationState}` : locationCity || locationState || "";

            // Build capability list from boolean flags
            const cap = company.capabilities?.[0];
            const capList = [
              cap?.pcb_assembly_smt ? "SMT" : null,
              cap?.cable_harness_assembly ? "Cable" : null,
              cap?.box_build_assembly ? "Box Build" : null,
              cap?.pcb_assembly_through_hole ? "Through Hole" : null,
              cap?.prototyping ? "Prototyping" : null,
            ].filter(Boolean) as string[];

            const visibleCaps = capList.slice(0, 3);
            const moreCaps = Math.max(0, capList.length - visibleCaps.length);

            const locationCount = company.facilities?.filter((f) => f.latitude && f.longitude).length || 0;
            const letter = company.company_name?.charAt(0) || "C";

            return (
              <Link key={company.id} href={`/companies/${company.slug}`} className="group block">
                <div
                  className="
                    relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200
                    bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl
                  "
                >
                  {/* Gradient accent line */}
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <span className="text-sm font-bold">{letter}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans text-[1.05rem] font-semibold leading-tight tracking-tight text-gray-900 group-hover:text-blue-600">
                          <ClampText lines={2} className="break-words">
                            {company.company_name}
                          </ClampText>
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {location && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="truncate">{location}</span>
                            </span>
                          )}
                          {locationCount > 1 && (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                              <MapPin className="h-3 w-3" />
                              {locationCount} locations
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {company.description && (
                    <ClampText lines={3} className="mb-4 flex-grow text-sm leading-6 text-gray-700">
                      {company.description}
                    </ClampText>
                  )}

                  {/* Stats */}
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                    {company.employee_count_range && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        {company.employee_count_range}
                      </span>
                    )}
                    {company.certifications && company.certifications.length > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-gray-400" />
                        {company.certifications.length} Certs
                      </span>
                    )}
                  </div>

                  {/* Capabilities */}
                  {visibleCaps.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {visibleCaps.map((label) => (
                        <CapabilityChip key={label}>{label}</CapabilityChip>
                      ))}
                      {moreCaps > 0 && <CapabilityChip>+{moreCaps} more</CapabilityChip>}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-1">
                      {company.website_url && <Globe className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="flex items-center text-blue-600 transition-colors group-hover:text-blue-700">
                      <span className="text-xs font-medium">View Details</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filteredCompanies.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}