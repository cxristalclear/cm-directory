import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/lib/config'
import { resolveCompanyCanonicalUrl } from '@/lib/canonical'
import { getBuildTimestamp, toIsoString } from '@/lib/time'
import type { Company } from '@/types/company'

export const dynamic = 'force-dynamic'

type CompanyFeedRow = Pick<
  Company,
  'slug' | 'company_name' | 'description' | 'updated_at'
> & {
  cms_metadata: Company['cms_metadata']
}

type SupabaseCompanyRow = Omit<CompanyFeedRow, 'cms_metadata'> & {
  cms_metadata?: Company['cms_metadata']
}

type CanonicalMetadata = {
  canonical_path?: string | null
} | null

type FeedItem = {
  title: string
  link: string
  description?: string
  updatedIsoString: string
}

const buildTimestamp = getBuildTimestamp()

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function extractCanonicalMetadata(value: CompanyFeedRow['cms_metadata']): CanonicalMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const canonicalPath = (value as Record<string, unknown>).canonical_path
  if (typeof canonicalPath === 'string') {
    return { canonical_path: canonicalPath }
  }

  if (canonicalPath === null || typeof canonicalPath === 'undefined') {
    return { canonical_path: null }
  }

  return null
}

function buildFeedItems(rows: CompanyFeedRow[]): FeedItem[] {
  return rows.reduce<FeedItem[]>((items, row) => {
    const canonicalUrl = resolveCompanyCanonicalUrl({
      slug: row.slug ?? undefined,
      cms_metadata: extractCanonicalMetadata(row.cms_metadata),
    })

    if (!canonicalUrl) {
      return items
    }

    const updatedIsoString = toIsoString(row.updated_at, buildTimestamp)

    items.push({
      title: row.company_name,
      link: canonicalUrl,
      description: row.description ?? undefined,
      updatedIsoString,
    })

    return items
  }, [])
}

function serializeFeed(items: FeedItem[]): string {
  const feedUrl = `${siteConfig.url}/feed.xml`
  const latestUpdatedIsoString = items[0]?.updatedIsoString ?? buildTimestamp
  const lastBuildDate = new Date(latestUpdatedIsoString).toUTCString()

  const serializedItems = items
    .map((item) => {
      const parts = [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
        `      <pubDate>${new Date(item.updatedIsoString).toUTCString()}</pubDate>`,
      ]

      if (item.description) {
        parts.push(`      <description>${escapeXml(item.description)}</description>`)
      }

      parts.push('    </item>')
      return parts.join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(`${siteConfig.name} Updates`)}</title>`,
    `    <link>${escapeXml(siteConfig.url)}</link>`,
    `    <description>${escapeXml(`Latest manufacturer updates from ${siteConfig.name}`)}</description>`,
    '    <language>en-US</language>',
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    serializedItems,
    '  </channel>',
    '</rss>',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function GET(): Promise<Response> {
  const columns = 'slug, company_name, description, updated_at, cms_metadata'
  const { data, error } = await supabase
    .from('companies')
    .select(columns as unknown as '*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) {
    console.error('Failed to load feed data', error)
    return new Response('Unable to load feed', { status: 500 })
  }

  const supabaseRows = (data ?? []) as SupabaseCompanyRow[]
  const rows: CompanyFeedRow[] = supabaseRows.map((row) => ({
    slug: row.slug,
    company_name: row.company_name,
    description: row.description,
    updated_at: row.updated_at,
    cms_metadata: row.cms_metadata ?? null,
  }))
  const items = buildFeedItems(rows)
  const body = serializeFeed(items)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
    },
  })
}
