"use client"

import Link from "next/link"
import { Building2, Menu, Search, X } from "lucide-react"
import { useState } from "react"
import { siteConfig } from "@/lib/config"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block text-lg tracking-tight">{siteConfig.name}</span>
        </Link>

        {/* Global Search - Centered & Compact */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search manufacturers, capabilities, or certifications..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">/</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="/industries" className="hover:text-blue-600 transition-colors">Industries</Link>
          </div>
          
          <div className="w-px h-6 bg-slate-200 hidden md:block mx-2" />
          
          <Link href="/list-your-company" className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            Add Company
          </Link>

          <button 
            className="md:hidden p-2 -mr-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 absolute w-full shadow-xl">
          <input 
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-4 pr-4 rounded-lg bg-slate-100 border-transparent text-sm mb-4"
          />
          <Link href="/about" className="block text-sm font-medium text-slate-600 py-2">About</Link>
          <Link href="/industries" className="block text-sm font-medium text-slate-600 py-2">Industries</Link>
          <Link href="/list-your-company" className="block w-full text-center h-10 leading-10 rounded-lg bg-blue-600 text-white text-sm font-medium mt-4">
            List Your Company
          </Link>
        </div>
      )}
    </nav>
  )
}