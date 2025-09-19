// app/pcb-assembly-manufacturers/page.tsx
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FilterProvider } from "@/contexts/FilterContext";
import CompanyList from "@/components/CompanyList";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "PCB Assembly Manufacturers (SMT / Through-Hole) | CM Directory",
  description:
    "Engineer-first list of PCB assembly manufacturers offering SMT, Through-Hole, and mixed assembly with testing and prototyping options.",
  alternates: { canonical: "https://www.example.com/pcb-assembly-manufacturers" },
  openGraph: { title: "PCB Assembly Manufacturers", type: "website" },
  twitter: { card: "summary" },
};

export default async function PCBAssemblyManufacturers() {
  const companies = await getCompanies();

  const pcbAssembly = companies.filter((c: any) => {
    const caps = c?.capabilities?.[0];
    return caps?.pcb_assembly_smt || caps?.pcb_assembly_through_hole;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PCB Assembly Manufacturers",
    url: "https://www.example.com/pcb-assembly-manufacturers",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="pcb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">PCB Assembly</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-1">PCB Assembly Manufacturers (SMT / Through-Hole)</h1>
        <p className="text-gray-600 mb-4">Compare SMT and Through-Hole assembly providers, then refine by certifications and location.</p>

        <FilterProvider>
          <div className="companies-directory">
            <CompanyList allCompanies={pcbAssembly} />
          </div>
        </FilterProvider>
      </main>
    </div>
  );
}
