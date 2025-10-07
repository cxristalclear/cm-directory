import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChangeHistoryTimeline from '@/components/admin/ChangeHistoryTimeline'

export default async function CompanyHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = createServerComponentClient({ cookies })
  const { slug } = await params

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, company_name, slug')
    .eq('slug', slug)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Fetch change history
  const { data: changeHistory, error: historyError } = await supabase
    .from('company_change_log')
    .select('*')
    .eq('company_id', company.id)
    .order('changed_at', { ascending: false })

  if (historyError) {
    console.error('Error fetching change history:', historyError)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/companies/edit/${company.slug}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Edit
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
        <p className="mt-1 text-sm text-gray-500">Change History</p>
      </div>

      <ChangeHistoryTimeline changes={changeHistory || []} />
    </div>
  )
}