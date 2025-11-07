import Link from 'next/link'
import { siteConfig } from '@/lib/config'

const currentYear = new Date().getFullYear()

<<<<<<< HEAD
=======
const legalLinks = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

>>>>>>> 12f2bb7 (temp: bring in local work)
const footerLinks = [
  { href: '/industries', label: 'Industries' },
  { href: '/sitemap.xml', label: 'Sitemap' },
  { href: '/feed.xml', label: 'RSS Feed' },
  { href: '/about', label: 'About' },
]

<<<<<<< HEAD
export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3">
          <h2 className="text-lg font-semibold">{siteConfig.name}</h2>
          <p className="text-sm text-slate-400">
            Discover verified contract manufacturers, compare capabilities, and connect with new partners.
          </p>
          <p className="text-xs text-slate-500">
            Subscribe to our updates feed to keep Search Console and subscribers aware of the latest profile changes.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Resources</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="transition-colors hover:text-white"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        © {currentYear} {siteConfig.name}. All rights reserved.
=======
const linkClass =
  'text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">{siteConfig.name}</h2>
            <p className="text-sm text-slate-300">
              Discover verified contract manufacturers, compare capabilities, and connect with new partners.
            </p>
            <p className="text-xs text-slate-500">
              Subscribe to our updates feed to keep Search Console and subscribers aware of the latest profile changes.
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
>>>>>>> 12f2bb7 (temp: bring in local work)
      </div>
    </footer>
  )
}
