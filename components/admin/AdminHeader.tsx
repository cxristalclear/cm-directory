'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: SupabaseUser
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 admin-header lg:mt-0 mt-14">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Search bar - placeholder for now */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <input
              type="search"
              placeholder="Search companies..."
              className="w-full px-4 py-2 admin-search-input glow-on-focus"
            />
          </div>
        </div>

        {/* User menu */}
        <div className="relative ml-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="admin-btn-secondary flex items-center gap-2 text-sm font-medium px-3 py-2"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:block">{user.email}</span>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 glass-card glass-card-heavy gradient-border p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="admin-btn-secondary flex items-center gap-2 w-full justify-start text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}