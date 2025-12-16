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
  twitter?: Metadata["twitter"]
  keywords?: string[]
  other?: Metadata["other"]
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
  twitter,
  keywords,
  other,
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
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
    locale: "en_US",
  }

  // Normalize images to an array - Next.js allows single image or array
  const normalizedImages = openGraph?.images
    ? Array.isArray(openGraph.images)
      ? openGraph.images
      : [openGraph.images]
    : baseOg.images

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
      images: normalizedImages.map(img => {
        // Handle string or URL images (URL only)
        if (typeof img === 'string' || img instanceof URL) {
          return {
            url: typeof img === 'string' ? img : img.toString(),
            width: 1200,
            height: 630,
            alt: title,
          }
        }
        // Handle image descriptor objects
        return {
          ...img,
          url: typeof img.url === 'string' ? img.url : img.url.toString(),
          width: 'width' in img ? (img.width ?? 1200) : 1200,
          height: 'height' in img ? (img.height ?? 630) : 630,
        }
      }),
    },
    ...(twitter ? { twitter } : {}),
    robots,
    other: {
      ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
      ...(other ? Object.fromEntries(
        Object.entries(other).filter(([, value]) => value !== undefined)
      ) : {}),
    },
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
