import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import CompanyDetailClient from './CompanyDetailClient'
import type { Metadata } from 'next'
import { CompanySchema } from '@/components/CompanySchema'


// Cache the company fetch function
const getCompany = cache(async (slug: string) => {
  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      *,
      facilities (*),
      capabilities (*),
      certifications (*),
      industries (*),
      contacts (*),
      technical_specs (*),
      business_info (*),
      verification_data (*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !company) {
    return null
  }

  return company
})

// Generate static params for all companies (Static Generation)
export async function generateStaticParams() {
  const { data: companies } = await supabase
    .from('companies')
    .select('slug')
    .limit(100) // Adjust based on your needs

  return companies?.map((company: { slug: string }) => ({
    slug: company.slug,
  })) || []
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;              // ✅ await params
  const company = await getCompany(slug);

  if (!company) return { title: 'Company Not Found' };

  return {
    title: `${company.company_name || 'Company'} - Contract Manufacturer`,
    description: company.description || `Learn more about ${company.company_name || 'this company'}`,
  };
}

// Main page component (Server Component)
export default async function CompanyPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;              // ✅ await params
  if (!slug) notFound();

  const company = await getCompany(slug);
  if (!company) notFound();

  return (
    <>
      <CompanyDetailClient company={company} />
      <CompanySchema company={company} />
    </>
  );
}