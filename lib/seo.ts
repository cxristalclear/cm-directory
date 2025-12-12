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
  twitter?: Metadata["twitter"]
  robots?: Metadata["robots"]
}

/**
 * Builds a Metadata object with sensible defaults for title/OG/Twitter/canonical.
 * Provide a path for canonical; it will be resolved against the configured site URL.
 */
export function buildMetadata({
  title,
  description,
  canonicalPath,
  openGraph,
  twitter,
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

  const baseTwitter = {
    card: "summary_large_image",
    title,
    description,
    images: [siteConfig.ogImage],
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
    twitter: {
      ...baseTwitter,
      ...twitter,
      images: twitter?.images ?? baseTwitter.images,
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
    twitter: {
      ...(base.twitter || {}),
      ...(overrides.twitter || {}),
      images: overrides.twitter?.images ?? base.twitter?.images,
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
