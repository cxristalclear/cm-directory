"use client"

import Link from "next/link"
import { trackListCompanyClick, trackContactSalesClick } from "@/lib/utils/analytics"

interface TrackedLinkProps {
  href: string
  className?: string
  children: React.ReactNode
  trackingType: 'list_company' | 'contact_sales'
  location: string
}

export function TrackedLink({ href, className, children, trackingType, location }: TrackedLinkProps) {
  const handleClick = () => {
    if (trackingType === 'list_company') {
      trackListCompanyClick(location)
    } else if (trackingType === 'contact_sales') {
      trackContactSalesClick(location)
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}

