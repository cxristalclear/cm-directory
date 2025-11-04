"use client"

import Link from "next/link"
import { Building2 } from "lucide-react"


export default function Navbar() {
    
  return (
    <header className="relative overflow-hidden">
      <div className="gradient-bg">
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-sans text-xl font-bold text-white">CM Directory</h1>
                <p className="text-xs text-blue-100">Manufacturing Network</p>
              </div>
            </Link>
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/industries" className="text-sm font-medium text-white/90 hover:text-white">
                Industries
              </Link>
              <Link href="/about" className="text-sm font-medium text-white/90 hover:text-white">
                About
              </Link>
              <Link
                  href="/add-your-company"
                  className="rounded-lg bg-blue-700/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-blue-700/30"
                >
                  Add Your Company
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
