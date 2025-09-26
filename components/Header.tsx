import Link from "next/link"
import { Building2 } from "lucide-react"

type HeaderProps = {
  filteredCount: number
  visibleCount: number
  activeFilterCount: number
  clearHref?: string
}

export default function Header({ filteredCount, visibleCount, activeFilterCount, clearHref }: HeaderProps) {
  const hasFilters = activeFilterCount > 0
  const clearUrl = clearHref ?? "/"

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
              <Link href="/about" className="text-sm font-medium text-white/90 hover:text-white">
                About
              </Link>
              <Link
                href="/add-company"
                className="inline-flex items-center justify-center rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-white/70 backdrop-blur hover:bg-white"
              >
                Add Your Company
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 py-8 md:py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-3 text-3xl font-bold leading-tight text-white md:text-5xl">
                Find Your Next Manufacturing Partner
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                Connect with verified contract manufacturers. Filter by location, capabilities, and production volume.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 text-white sm:flex-row sm:gap-4">
                <span className="text-sm font-medium uppercase tracking-widest text-blue-100">
                  Showing {visibleCount} of {filteredCount} manufacturers
                </span>
                {hasFilters && (
                  <Link
                    href={clearUrl}
                    scroll={false}
                    className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Clear filters ({activeFilterCount})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>
      </div>
    </header>
  )
}
