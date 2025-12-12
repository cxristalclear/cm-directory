import type React from "react"
import { siteConfig } from "./config"

const SCHEMA_CONTEXT = "https://schema.org" as const

export type JsonLd<T extends Record<string, unknown>> = T & {
  "@context": typeof SCHEMA_CONTEXT
}

export type OrganizationJsonLd = JsonLd<{
  "@type": "Organization"
  name: string
  url: string
  logo: string
  sameAs: string[]
}>

export const organizationJsonLd: OrganizationJsonLd = {
  "@context": SCHEMA_CONTEXT,
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: siteConfig.ogImage,
  sameAs: Object.values(siteConfig.links).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  ),
}

export type WebSiteJsonLd = JsonLd<{
  "@type": "WebSite"
  name: string
  url: string
  potentialAction?: {
    "@type": "SearchAction"
    target: string
    "query-input": string
  }
}>

export const webSiteJsonLd: WebSiteJsonLd = {
  "@context": SCHEMA_CONTEXT,
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

export type BreadcrumbInput = {
  name: string
  url: string
}

export type BreadcrumbListJsonLd = JsonLd<{
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }>
}>

export const createBreadcrumbListJsonLd = (
  breadcrumbs: BreadcrumbInput[],
): BreadcrumbListJsonLd => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.url,
  })),
})

export interface CollectionPageSchemaInput {
  name: string
  description?: string
  url: string
  numberOfItems?: number
  breadcrumbs: BreadcrumbInput[]
}

export type CollectionPageJsonLd = JsonLd<{
  "@type": "CollectionPage"
  name: string
  description?: string
  url: string
  numberOfItems?: number
  breadcrumb: BreadcrumbListJsonLd
}>

export const createCollectionPageJsonLd = ({
  name,
  description,
  url,
  numberOfItems,
  breadcrumbs,
}: CollectionPageSchemaInput): CollectionPageJsonLd => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "CollectionPage",
  name,
  ...(description ? { description } : {}),
  url,
  ...(typeof numberOfItems === "number"
    ? { numberOfItems }
    : {}),
  breadcrumb: createBreadcrumbListJsonLd(breadcrumbs),
})

export const jsonLdScriptProps = (
  schema: JsonLd<Record<string, unknown>>,
): React.ScriptHTMLAttributes<HTMLScriptElement> => ({
  type: "application/ld+json",
  suppressHydrationWarning: true,
  dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
})
