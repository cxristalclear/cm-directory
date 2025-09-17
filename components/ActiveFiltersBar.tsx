/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X } from "lucide-react";
import { useFilters } from "../contexts/FilterContext";

type ChipProps = {
  label: string;
  onRemove?: () => void;
};
function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
      {label}
      {onRemove && (
        <button
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}

export default function ActiveFiltersBar() {
  const { filters, setFilters, clearAll } = useFilters() as any;

  // Helpers to remove one filter value from an array in state
  const removeFromArray = (key: string, value: string) =>
    setFilters((prev: any) => ({
      ...prev,
      [key]: (prev?.[key] as string[]).filter((v: string) => v !== value),
    }));

  // Individual removers
  const removeState = (val: string) => removeFromArray("states", val);
  const removeCountry = (val: string) => removeFromArray("countries", val);
  const removeCapability = (val: string) => removeFromArray("capabilities", val);
  const removeVolume = (val: string) => removeFromArray("volumeCapability", val);
  const removeCert = (val: string) => removeFromArray("certifications", val);
  const removeIndustry = (val: string) => removeFromArray("industries", val);
  const removeEmployeeRange = (val: string) => removeFromArray("employeeRange", val);
  const clearSearch = () => setFilters((p: any) => ({ ...p, searchTerm: "" }));

  const chips: React.ReactNode[] = [];

  if (filters?.searchTerm) {
    chips.push(<Chip key={`q:${filters.searchTerm}`} label={`“${filters.searchTerm}”`} onRemove={clearSearch} />);
  }
  for (const s of filters?.states ?? []) chips.push(<Chip key={`st:${s}`} label={s} onRemove={() => removeState(s)} />);
  for (const c of filters?.countries ?? [])
    chips.push(<Chip key={`co:${c}`} label={c} onRemove={() => removeCountry(c)} />);
  for (const c of filters?.capabilities ?? [])
    chips.push(<Chip key={`cap:${c}`} label={capPretty(c)} onRemove={() => removeCapability(c)} />);
  for (const v of filters?.volumeCapability ?? [])
    chips.push(<Chip key={`vol:${v}`} label={`${v} volume`} onRemove={() => removeVolume(v)} />);
  for (const k of filters?.certifications ?? [])
    chips.push(<Chip key={`cert:${k}`} label={slugToTitle(k)} onRemove={() => removeCert(k)} />);
  for (const i of filters?.industries ?? [])
    chips.push(<Chip key={`ind:${i}`} label={slugToTitle(i)} onRemove={() => removeIndustry(i)} />);
  for (const r of filters?.employeeRange ?? [])
    chips.push(<Chip key={`er:${r}`} label={`${r} employees`} onRemove={() => removeEmployeeRange(r)} />);

  const hasAny = chips.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">{hasAny ? chips : <span className="text-sm text-neutral-500">No active filters</span>}</div>
      {hasAny && (
        <button
          onClick={() => clearAll?.()}
          className="text-sm font-medium text-blue-700 hover:text-blue-800"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function slugToTitle(slug: string) {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function capPretty(key: string) {
  switch (key) {
    case "smt":
      return "SMT";
    case "through_hole":
      return "Through Hole";
    case "cable_harness":
      return "Cable";
    case "box_build":
      return "Box Build";
    case "prototyping":
      return "Prototyping";
    default:
      return slugToTitle(key);
  }
}
