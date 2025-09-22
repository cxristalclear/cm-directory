// app/contract-manufacturers/[cert]/page.tsx
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FilterProvider } from "@/contexts/FilterContext";
import CompanyList from "@/components/CompanyList";
import Script from "next/script";
import type { Company } from "@/types/company";

async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      facilities(*),
      capabilities(*),
      certifications(*),
      industries(*)
    `)
    .eq("is_active", true);
  if (error || !data) return [];
  return data as Company[];
}

function normalizeCertParam(param: string) {
  // map dashed route to human-readable (e.g., iso-13485 -> ISO 13485)
  return param.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function generateMetadata({ params }: { params: { cert: string } }): Promise<Metadata> {
  const certNice = normalizeCertParam(params.cert);
  const title = `${certNice} Contract Manufacturers | CM Directory`;
  const description = `Browse verified electronics manufacturers with ${certNice}. Compare capabilities (SMT, Through-Hole, Box Build) and locations.`;
  const canonical = `https://www.example.com/contract-manufacturers/${params.cert}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CertManufacturers({ params }: { params: { cert: string } }) {
  const companies = await getCompanies();
  const certNice = normalizeCertParam(params.cert);
  const certLower = certNice.toLowerCase();

  const byCert = companies.filter((company) =>
    (company.certifications ?? []).some(
      (certification) =>
        typeof certification?.certification_type === "string" &&
        certification.certification_type.toLowerCase() === certLower,
    ),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certNice} Contract Manufacturers`,
    url: `https://www.example.com/contract-manufacturers/${params.cert}`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="cert-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/pcb-assembly-manufacturers" className="underline">PCB Assembly</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">{certNice}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-1">{certNice} Contract Manufacturers</h1>
        <p className="text-gray-600 mb-4">Medical, aerospace, and regulated industries often require {certNice}. Compare verified partners and contact directly.</p>

        <FilterProvider>
          <div className="companies-directory">
            <CompanyList allCompanies={byCert} />
          </div>
        </FilterProvider>
      </main>
    </div>
  );
}
