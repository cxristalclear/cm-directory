// app/manufacturers/[state]/page.tsx
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FilterProvider } from "@/contexts/FilterContext"; // same provider CompanyList relies on
import CompanyList from "@/components/CompanyList"; // uses allCompanies prop
import Script from "next/script";

// ---------- data fetch (same shape you already use) ----------
async function getCompanies() {
  const { data: companies, error } = await supabase
    .from("companies")
    .select(`
      *,
      facilities(*),
      capabilities(*),
      certifications(*),
      industries(*)
    `)
    .eq("is_active", true);
  if (error) return [];
  return companies || [];
}

// ---------- metadata ----------
export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateName = params.state.replace(/-/g, " ");
  const title = `Electronics Contract Manufacturers in ${stateName} | CM Directory`;
  const description = `Find verified electronics CMs in ${stateName}. Compare PCB assembly (SMT/Through-Hole), box build, cable harness, and certifications like ISO 13485 & AS9100.`;
  const canonical = `https://www.example.com/manufacturers/${params.state}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description }
  };
}

// ---------- page ----------
export default async function StateManufacturers({ params }: { params: { state: string } }) {
  const stateParam = params.state.toLowerCase();
  const companies = await getCompanies();

  // Filter server-side by facility state (simple + safe)
  const byState = companies.filter((c: any) => {
    const s = c?.facilities?.[0]?.state;
    return s && s.toLowerCase() === stateParam;
  });

  const nice = params.state.replace(/-/g, " ");

  // JSON-LD for the collection
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Contract Manufacturers in ${nice}`,
    url: `https://www.example.com/manufacturers/${params.state}`
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="state-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">{nice}</li>
          </ol>
        </nav>

        {/* H1 */}
        <h1 className="text-3xl font-bold mb-1">Contract Manufacturers in {nice}</h1>
        <p className="text-gray-600 mb-4">Browse verified PCB assembly partners located in {nice}. Filter further by capabilities and certifications.</p>

        {/* Internal links to key taxonomies */}
        <div className="mb-4 text-sm">
          <Link href="/pcb-assembly-manufacturers" className="underline mr-3">PCB Assembly</Link>
          <Link href="/contract-manufacturers/iso-13485" className="underline mr-3">ISO 13485</Link>
          <Link href="/contract-manufacturers/as9100" className="underline">AS9100</Link>
        </div>

        <FilterProvider>
          <div className="companies-directory">
            <CompanyList allCompanies={byState} />
          </div>
        </FilterProvider>
      </main>
    </div>
  );
}
