import Link from 'next/link'
import { siteConfig } from '@/lib/config'

const currentYear = new Date().getFullYear()

const footerLinks = [
  { href: '/sitemap.xml', label: 'Sitemap' },
  { href: '/feed.xml', label: 'RSS Feed' },
  { href: '/about', label: 'About' },
]

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
      </div>
    </footer>
  )
}
