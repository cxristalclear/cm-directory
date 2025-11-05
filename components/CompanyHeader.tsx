"use client"

import Link from "next/link"
import { Building2} from 'lucide-react'




export default function CompanyHeader() {
  const ADD_COMPANY_PATH = "/add-company"

  return (
    <header className="relative overflow-hidden">
      {/* Background with gradient - same as main header */}
      <div className="gradient-bg">
        {/* Navigation Bar */}
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-sans">CM Directory</h1>
                  <p className="text-xs text-blue-100">Manufacturing Network</p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-6">
                <a href="/about" className="text-sm font-medium text-white/90 hover:text-white">
                  About
                </a>
                <Link
                  href={ADD_COMPANY_PATH}
                  className="inline-flex items-center justify-center rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-white/70 backdrop-blur hover:bg-white"
                >
                  Add Your Company
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Decorative elements - same as main header */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </header>
  )
}