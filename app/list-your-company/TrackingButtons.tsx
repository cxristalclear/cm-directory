"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { trackListCompanyClick, trackContactSalesClick, trackFormSubmissionClick } from "@/lib/utils/analytics"

interface ButtonProps {
  className?: string
  children?: React.ReactNode
}

export function ListCompanyButton({ className, children }: ButtonProps) {
  return (
    <Link
      href="/list-your-company"
      onClick={() => trackListCompanyClick('list_page_hero')}
      className={className}
    >
      {children}
    </Link>
  )
}

export function ContactSalesButton({ className, children }: ButtonProps) {
  return (
    <Link
      href="/contact"
      onClick={() => trackContactSalesClick('list_page')}
      className={className}
    >
      {children}
    </Link>
  )
}

export function SubmitFormButton({ className, children }: ButtonProps) {
  return (
    <Link
      href="#submit"
      onClick={() => trackFormSubmissionClick('list_page')}
      className={className}
    >
      {children}
    </Link>
  )
}

