import type { Metadata } from "next"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

const colorSwatches = [
  { name: "Background", token: "var(--background)" },
  { name: "Foreground", token: "var(--foreground)" },
  { name: "Primary", token: "var(--primary)" },
  { name: "Secondary", token: "var(--secondary)" },
  { name: "Accent", token: "var(--accent)" },
  { name: "Muted", token: "var(--muted)" },
  { name: "Border", token: "var(--border)" },
]

export default function StyleguidePage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-container section section--tight space-y-6">
        <header className="space-y-2">
          <p className="eyebrow">Styleguide</p>
          <h1 className="heading-xl">Public UI primitives</h1>
          <p className="body-lg max-w-2xl text-muted-foreground">
            Quick reference for the shared layout, typography, and surface styles that keep public pages cohesive.
          </p>
        </header>

        <section className="card-compact p-6 space-y-4">
          <h2 className="heading-md">Typography</h2>
          <div className="space-y-3">
            <div>
              <p className="eyebrow">Eyebrow</p>
              <p className="heading-xl">Heading XL</p>
              <p className="body text-muted-foreground">Heading for hero and top-level sections.</p>
            </div>
            <div>
              <p className="heading-lg">Heading LG</p>
              <p className="body text-muted-foreground">Section titles and key subsections.</p>
            </div>
            <div>
              <p className="heading-md">Heading MD</p>
              <p className="body text-muted-foreground">Card or panel headings.</p>
            </div>
            <div className="space-y-1">
              <p className="body-lg">Body LG - lead paragraphs.</p>
              <p className="body">Body - standard copy.</p>
              <p className="body-sm">Body SM - supporting text and labels.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card-compact p-6 space-y-4">
            <h2 className="heading-md">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn--primary">Primary</button>
              <button className="btn btn--secondary">Secondary</button>
              <button className="btn btn--outline">Outline</button>
              <button className="btn btn--ghost">Ghost</button>
              <button className="btn btn--primary btn--sm">Compact</button>
            </div>
          </div>

          <div className="card-compact p-6 space-y-4">
            <h2 className="heading-md">Chips and badges</h2>
            <div className="flex flex-wrap gap-2">
              <span className="chip">Default chip</span>
              <span className="chip chip--primary">Primary chip</span>
              <span className="chip chip--muted">Muted chip</span>
            </div>
          </div>
        </section>

        <section className="card-compact p-6 space-y-4">
          <h2 className="heading-md">Cards</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-4 space-y-2">
              <p className="heading-md">Featured card</p>
              <p className="body text-muted-foreground">
                Use for primary content blocks. Soft shadow and border keep it elevated but clean.
              </p>
              <button className="btn btn--primary btn--sm">Call to action</button>
            </div>
            <div className="card-compact p-4 space-y-2">
              <p className="heading-md">Compact card</p>
              <p className="body text-muted-foreground">Use for lists or side panels where space is tight.</p>
              <button className="btn btn--outline btn--sm">Secondary</button>
            </div>
            <div className="card p-4 space-y-2">
              <p className="heading-md">List item</p>
              <p className="body text-muted-foreground">Stack multiple of these for consistent rows.</p>
              <div className="flex gap-2">
                <span className="chip chip--primary">Capability</span>
                <span className="chip chip--muted">Tag</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card-compact p-6 space-y-4">
          <h2 className="heading-md">Colors</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {colorSwatches.map(color => (
              <div key={color.name} className="card-compact flex items-center justify-between p-3">
                <div className="space-y-1">
                  <p className="body font-semibold">{color.name}</p>
                  <p className="body-sm text-muted-foreground">{color.token}</p>
                </div>
                <span
                  className="h-10 w-14 rounded-md border border-border"
                  style={{ background: color.token }}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
