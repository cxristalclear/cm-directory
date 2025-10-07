import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import EditCompanyForm from '@/components/admin/EditCompanyForm'

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // ✅ CORRECT: Pass cookies directly
  const supabase = createServerComponentClient({ cookies })
  const { slug } = await params

  // Fetch company with all related data
  const { data: company, error } = await supabase
    .from('companies')
    .select(
      `
      *,
      facilities(*),
      capabilities(*),
      industries(*),
      certifications(*),
      technical_specs(*),
      business_info(*)
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update company profile information
        </p>
        {company.updated_at && (
          <p className="mt-1 text-xs text-gray-400">
            Last modified: {new Date(company.updated_at).toLocaleString()}
          </p>
        )}
      </div>

      <EditCompanyForm company={company} />
    </div>
  )
}