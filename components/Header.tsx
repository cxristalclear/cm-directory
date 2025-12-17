"use client"

import { useFilters } from "@/contexts/FilterContext"
import { GradientHero } from "@/components/GradientHero"

export default function Header() {
  useFilters()

  return (
    <header>
      <GradientHero
        title="The Search Engine for PCBA Manufacturing."
        subtitle="Connect with verified contract manufacturers. Use interactive filters to discover contract manufacturers aligned with your technical, compliance, and capacity requirements."
        variant="centered"
        padding="sm"
      />
    </header>
  )
}
