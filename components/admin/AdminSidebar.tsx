'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Plus, 
  List,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Add Company', href: '/admin/companies/add', icon: Plus },
  { name: 'All Companies', href: '/admin/companies', icon: List },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 admin-sidebar glass-card px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="admin-btn-secondary inline-flex items-center justify-center gap-2 text-sm"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed inset-y-0 left-0 z-30 w-64 admin-sidebar transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg admin-sidebar-logo">CM Directory</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
            </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`admin-btn-secondary admin-nav-link flex items-center gap-3 text-sm ${
                    isActive ? 'admin-nav-link-active' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 glass-card-light gradient-border backdrop-blur-sm !rounded-none"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}