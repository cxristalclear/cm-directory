// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.example.com";

  // Companies with updated_at & slug (adjust column if your timestamp differs)
  const { data: companies = [] } = await supabase
    .from("companies")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Distinct states from facilities
  const { data: facilities = [] } = await supabase
    .from("facilities")
    .select("state")
    .not("state", "is", null);

  const { data: certs = [] } = await supabase
    .from("certifications")
    .select("certification_type")
    .not("certification_type", "is", null);

  const certSlugs = Array.from(
    new Set((certs as { certification_type: string }[])
      .map(c => c.certification_type?.trim())
      .filter(Boolean)
      .map(c => c!.toLowerCase().replace(/\s+/g, "-")))
  );

  const states = Array.from(new Set((facilities as { state: string }[]).map(f => (f.state || "").toLowerCase()).filter(Boolean)));

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 0.9 },
  ];

  // State pages (if you later add the pages, this readies SEO)
  for (const s of states) {
    entries.push({ url: `${base}/manufacturers/${s}`, changeFrequency: "weekly", priority: 0.7 });
  }

  // Company pages
  for (const c of companies as { slug: string; updated_at?: string }[]) {
    entries.push({
      url: `${base}/companies/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const c of certSlugs) {
    entries.push({ url: `${base}/contract-manufacturers/${c}`, changeFrequency: "weekly", priority: 0.7 });
  }

  return entries;
}
