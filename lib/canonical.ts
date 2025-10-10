import { getCanonicalUrl } from '@/lib/config'

type CanonicalMetadata = {
  canonical_path?: string | null
} | null

type CanonicalInput = {
  slug?: string | null
  cms_metadata?: CanonicalMetadata
}

export function resolveCompanyCanonicalUrl(
  company: CanonicalInput,
  canonicalOverride?: string | null,
): string | undefined {
  const override = canonicalOverride?.trim()
  if (override) {
    return override.startsWith('http') ? override : getCanonicalUrl(override)
  }

  const cmsCanonical = company.cms_metadata?.canonical_path?.toString().trim()
  if (cmsCanonical) {
    return cmsCanonical.startsWith('http') ? cmsCanonical : getCanonicalUrl(cmsCanonical)
  }

  const slug = company.slug?.toString().trim()
  if (slug) {
    return getCanonicalUrl(`/companies/${slug}`)
  }

  return undefined
}
