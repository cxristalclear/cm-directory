import { getCanonicalUrl } from "@/lib/config"

const staticPaths = [
  "/",
  "/search",
  "/about",
  "/add-your-company",
  "/resources",
  "/privacy",
  "/terms",
]

function buildXml(): string {
  const urls = staticPaths
    .map((path) => {
      const canonicalUrl = getCanonicalUrl(path)
      return [
        "  <url>",
        `    <loc>${canonicalUrl}</loc>`,
        "    <changefreq>weekly</changefreq>",
        "    <priority>0.8</priority>",
        "  </url>",
      ].join("\n")
    })
    .join("\n")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n")
}

export async function GET(): Promise<Response> {
  const body = buildXml()

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
