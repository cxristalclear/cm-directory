import { STATE_NAMES } from "@/utils/stateMapping"

const slugifyStateName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export type StateMetadata = {
  abbreviation: string
  name: string
  slug: string
}

const baseMetadata: StateMetadata[] = Object.entries(STATE_NAMES).map(
  ([abbreviation, name]) => ({
    abbreviation,
    name,
    slug: slugifyStateName(name),
  }),
)

const abbreviationToMetadata = new Map<string, StateMetadata>(
  baseMetadata.map((metadata) => [metadata.abbreviation, metadata]),
)

const slugToMetadata = new Map<string, StateMetadata>(
  baseMetadata.map((metadata) => [metadata.slug, metadata]),
)

function createFallbackMetadata(abbreviationInput: string): StateMetadata {
  const abbreviation = abbreviationInput.trim().toUpperCase()
  const name = abbreviation
  const slug = abbreviation.toLowerCase()

  const metadata: StateMetadata = { abbreviation, name, slug }
  abbreviationToMetadata.set(abbreviation, metadata)
  if (!slugToMetadata.has(slug)) {
    slugToMetadata.set(slug, metadata)
  }

  return metadata
}

export function getStateMetadataByAbbreviation(
  abbreviation: string | null | undefined,
): StateMetadata | null {
  if (!abbreviation) {
    return null
  }

  const normalized = abbreviation.trim().toUpperCase()
  if (!normalized) {
    return null
  }

  const metadata = abbreviationToMetadata.get(normalized)
  if (metadata) {
    return metadata
  }

  return createFallbackMetadata(normalized)
}

export function getStateMetadataBySlug(slug: string | null | undefined): StateMetadata | null {
  if (!slug) {
    return null
  }

  const normalized = slug.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  const metadata = slugToMetadata.get(normalized)
  if (metadata) {
    return metadata
  }

  if (/^[a-z]{2}$/.test(normalized)) {
    return getStateMetadataByAbbreviation(normalized.toUpperCase())
  }

  return null
}

export function getAllStateMetadata(): StateMetadata[] {
  const uniqueMetadata = new Map<string, StateMetadata>()

  abbreviationToMetadata.forEach((metadata) => {
    uniqueMetadata.set(metadata.slug, metadata)
  })

  return Array.from(uniqueMetadata.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export function stateSlugFromAbbreviation(abbreviation: string | null | undefined): string | null {
  const metadata = getStateMetadataByAbbreviation(abbreviation)
  return metadata?.slug ?? null
}
