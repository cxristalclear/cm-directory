import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChangeHistoryTimeline from '@/components/admin/ChangeHistoryTimeline'
import type { Database } from '@/lib/database.types'

type CompanyBasic = {
  id: string
  company_name: string
  slug: string
}

type ChangeLog = {
  id: string
  changed_by_email: string
  changed_by_name: string
  changed_at: string
  change_type: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
  field_name: string | null
  old_value: string | null
  new_value: string | null
}

type RawChangeLog = Database['public']['Tables']['company_change_log']['Row']

export default async function CompanyHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  
  const supabase = await createClient()
  const { slug } = await params

  // Fetch company
  const { data: companyRaw, error: companyError } = await supabase
    .from('companies')
    .select('id, company_name, slug')
    .eq('slug', slug)
    .single()

  const company = companyRaw as CompanyBasic | null

  if (companyError || !company) {
    notFound()
  }

  // Fetch change history
  const { data: changeHistoryRaw, error: historyError } = await supabase
    .from('company_change_log')
    .select('*')
    .eq('company_id', company.id)
    .order('changed_at', { ascending: false })

  if (historyError) {
    console.error('Error fetching change history:', historyError)
  }

  // Cast to proper type with filtering for valid change_type values
  const changeHistory = ((changeHistoryRaw || []) as RawChangeLog[])
    .filter((change): change is RawChangeLog & { change_type: ChangeLog['change_type'] } => 
      ['created', 'claimed', 'updated', 'verified', 'approved', 'rejected'].includes(change.change_type)
    )
    .map(change => ({
      id: change.id,
      changed_by_email: change.changed_by_email,
      changed_by_name: change.changed_by_name,
      changed_at: change.changed_at,
      change_type: change.change_type,
      field_name: change.field_name,
      old_value: change.old_value,
      new_value: change.new_value,
    } as ChangeLog))

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <Link
          href={`/admin/companies/edit/${company.slug}`}
          className="admin-btn-secondary inline-flex w-fit items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Edit
        </Link>
        <div>
          <h1 className="text-3xl font-semibold gradient-text tracking-tight">
            {company.company_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Change History</p>
        </div>
      </div>

      <ChangeHistoryTimeline changes={changeHistory} />
    </div>
  )
}
