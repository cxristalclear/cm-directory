"use client"

import Link from "next/link"
import { Search, Building2, Filter } from "lucide-react"

interface HeaderProps {
  onSearchToggle?: () => void
  onFilterToggle?: () => void
}

export default function Header({ onSearchToggle, onFilterToggle }: HeaderProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Background with gradient */}
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

              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/manufacturers"
                  className="text-white/90 hover:text-white transition-colors text-sm font-medium"
                >
                  Browse All
                </Link>
                <Link
                  href="/industries"
                  className="text-white/90 hover:text-white transition-colors text-sm font-medium"
                >
                  Industries
                </Link>
                <Link href="/about" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  About
                </Link>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                  Add Your Company
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={onSearchToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={onFilterToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-sans leading-tight">
                Find Your Next Manufacturing Partner
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 leading-relaxed">
                Connect with verified contract manufacturers. Filter by capabilities, location, and
                certifications.
              </p>

              {/* Search Bar
              <div className="max-w-2xl mx-auto mb-6">
                <div className="glass-effect rounded-2xl p-2">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center space-x-3 px-4">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by company name, capability, or location..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
                      />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                      Search
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </header>
  )
}