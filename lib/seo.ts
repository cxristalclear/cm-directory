import type { Metadata } from "next"
import { getCanonicalUrl, siteConfig } from "@/lib/config"

type RobotsOptions = {
  index?: boolean
  follow?: boolean
  googleBot?: Metadata["robots"]
}

type BuildMetadataOptions = {
  title: string
  description: string
  canonicalPath?: string
  openGraph?: Metadata["openGraph"]
  robots?: Metadata["robots"]
}

/**
 * Builds a Metadata object with sensible defaults for title/OG/canonical.
 * Provide a path for canonical; it will be resolved against the configured site URL.
 */
export function buildMetadata({
  title,
  description,
  canonicalPath,
  openGraph,
  robots,
}: BuildMetadataOptions): Metadata {
  const canonical = canonicalPath ? getCanonicalUrl(canonicalPath) : siteConfig.url
  const baseOg = {
    title,
    description,
    url: canonical,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        alt: title,
      },
    ],
    type: "website",
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(openGraph?.url ? { canonical: openGraph.url } : {}),
    },
    openGraph: {
      ...baseOg,
      ...openGraph,
      images: openGraph?.images ?? baseOg.images,
    },
    robots,
  }
}

/**
 * Deep merges a base Metadata object with overrides for common SEO fields.
 */
export function mergeMetadataDefaults(base: Metadata, overrides?: Metadata): Metadata {
  if (!overrides) return base

  return {
    ...base,
    ...overrides,
    alternates: {
      ...base.alternates,
      ...overrides.alternates,
    },
    openGraph: {
      ...(base.openGraph || {}),
      ...(overrides.openGraph || {}),
      images: overrides.openGraph?.images ?? base.openGraph?.images,
    },
    robots: overrides.robots ?? base.robots,
  }
}

/**
 * Convenience helper for setting robots directives.
 */
export function buildRobots({
  index = true,
  follow = true,
  googleBot,
}: RobotsOptions = {}): NonNullable<Metadata["robots"]> {
  return {
    index,
    follow,
    ...(googleBot ? { googleBot } : {}),
  }
}
