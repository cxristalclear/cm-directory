import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpeedInsights } from "@vercel/speed-insights/next"


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-background min-h-screen"> {/* Add this wrapper */}
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={user} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}