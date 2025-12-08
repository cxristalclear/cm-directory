"use client"

import Link from "next/link"
import { Building2, Menu, X } from "lucide-react"
import { useState } from "react"
import { siteConfig } from "@/lib/config"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full gradient-bg text-white shadow-sm overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="sticky px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo Area */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white shadow-sm ring-1 ring-white/15">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block text-lg tracking-tight text-white">{siteConfig.name}</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/industries" className="hover:text-white transition-colors">
              Industries
            </Link>
          </div>
          
          <div className="w-px h-6 bg-white/20 hidden md:block mx-2" />
          
          <Link
            href="/list-your-company"
            className="hidden md:inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white/90 text-blue-700 text-sm font-semibold hover:bg-white transition-colors shadow-sm ring-1 ring-white/60 backdrop-blur"
          >
            Add Company
          </Link>

          <button 
            className="md:hidden p-2 -mr-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/5 px-4 py-6 space-y-4 absolute w-full shadow-xl backdrop-blur">
          <Link href="/about" className="block text-sm font-medium text-white/90 py-2 hover:text-white">
            About
          </Link>
          <Link href="/industries" className="block text-sm font-medium text-white/90 py-2 hover:text-white">
            Industries
          </Link>
          <Link
            href="/list-your-company"
            className="block w-full text-center h-10 leading-10 rounded-lg bg-white/90 text-blue-700 text-sm font-semibold mt-4 shadow-sm ring-1 ring-white/60"
          >
            List Your Company
          </Link>
        </div>
      )}
    </nav>
  )
}
