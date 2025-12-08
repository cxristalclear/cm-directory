import Link from 'next/link'
import { siteConfig } from '@/lib/config'

const currentYear = new Date().getFullYear()

const topCityLinks = [
  { href: '/manufacturers?state=TX&q=Austin', label: 'Manufacturers in Austin, TX' },
  { href: '/manufacturers?state=MA&q=Boston', label: 'Manufacturers in Boston, MA' },
  { href: '/manufacturers?state=CA&q=San%20Jose', label: 'Manufacturers in San Jose, CA' },
  { href: '/manufacturers?state=AZ&q=Phoenix', label: 'Manufacturers in Phoenix, AZ' },
  { href: '/manufacturers?state=IL&q=Chicago', label: 'Manufacturers in Chicago, IL' },
]

const topCapabilityLinks = [
  { href: '/?capability=smt', label: 'SMT Assembly' },
  { href: '/?capability=box_build', label: 'Box Build Integration' },
  { href: '/?capability=cable_harness', label: 'Cable Harness Assembly' },
  { href: '/?capability=through_hole', label: 'Through-Hole Assembly' },
  { href: '/?capability=prototyping', label: 'Prototype Builds' },
]

const legalLinks = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

const manufacturerActionLinks = [
  { href: '/list-your-company?intent=claim', label: 'Claim Profile' },
  { href: '/list-your-company?intent=update', label: 'Update Data' },
  { href: '/contact?topic=pricing', label: 'Pricing & Featured' },
]

const footerLinks = [
  { href: '/industries', label: 'Industries' },
  { href: '/sitemap.xml', label: 'Sitemap' },
  { href: '/feed.xml', label: 'RSS Feed' },
  { href: '/about', label: 'About' },
]

const linkClass =
  'text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,1fr))]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">{siteConfig.name}</h2>
            <p className="text-sm text-slate-300">
              Discover verified contract manufacturers, compare capabilities, and connect with new partners.
            </p>
            <p className="text-xs text-slate-500">
              Subscribe to our RSS feed to stay updated on the latest manufacturer profiles and industry news.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Top Cities</h3>
            <ul className="space-y-2">
              {topCityLinks.map(link => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Top Capabilities</h3>
            <ul className="space-y-2">
              {topCapabilityLinks.map(link => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">For Manufacturers</h3>
            <ul className="space-y-2">
              {manufacturerActionLinks.map(link => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-slate-500 md:flex-row md:justify-between">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <nav aria-label="Footer secondary links">
            <ul className="flex flex-wrap items-center gap-3 text-slate-400">
              {legalLinks.map(link => (
                <li key={`inline-${link.href}`}>
                  <Link className="transition-colors hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
