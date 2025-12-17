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

        <section className="card-compact p-6 space-y-6">
          <div>
            <h2 className="heading-md mb-2">Typography</h2>
            <p className="body-sm text-muted-foreground">
              Standardized typography classes for consistent heading and body text styles across the application.
            </p>
          </div>

          <div className="space-y-6">
            {/* Headings */}
            <div>
              <h3 className="heading-sm mb-4">Headings</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="eyebrow mb-1">Eyebrow</p>
                  <p className="heading-xl mb-2">Heading XL (H1)</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Page titles and hero sections. Uses <code className="text-xs bg-muted px-1 py-0.5 rounded">font-bold</code>.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;heading-xl&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-4xl md:text-5xl</code>
                  </p>
                </div>

                <div className="border-l-4 border-primary/50 pl-4">
                  <p className="heading-lg mb-2">Heading LG (H2)</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Section titles and major subsections. Uses <code className="text-xs bg-muted px-1 py-0.5 rounded">font-semibold</code>.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;heading-lg&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-3xl</code>
                  </p>
                </div>

                <div className="border-l-4 border-primary/30 pl-4">
                  <p className="heading-md mb-2">Heading MD (H3)</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Subsection titles. Uses <code className="text-xs bg-muted px-1 py-0.5 rounded">font-semibold</code>.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;heading-md&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-2xl</code>
                  </p>
                </div>

                <div className="border-l-4 border-primary/20 pl-4">
                  <p className="heading-sm mb-2">Heading SM (H4)</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Card titles and minor headings. Uses <code className="text-xs bg-muted px-1 py-0.5 rounded">font-semibold</code>.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;heading-sm&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-xl</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Body Text */}
            <div>
              <h3 className="heading-sm mb-4">Body Text</h3>
              <div className="space-y-3">
                <div>
                  <p className="body-lg mb-1">Body Large</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Lead paragraphs and emphasized body text.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;body-lg&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-base md:text-lg</code>
                  </p>
                </div>

                <div>
                  <p className="body mb-1">Body (Default)</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Standard body copy for paragraphs and content.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;body&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-sm md:text-base</code>
                  </p>
                </div>

                <div>
                  <p className="body-sm mb-1">Body Small</p>
                  <p className="body-sm text-muted-foreground mb-2">
                    Supporting text, labels, and captions.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    className=&quot;body-sm&quot;
                  </code>
                  <p className="body-sm text-muted-foreground mt-1">
                    Size: <code className="text-xs">text-xs md:text-sm</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Special */}
            <div>
              <h3 className="heading-sm mb-4">Special</h3>
              <div>
                <p className="eyebrow mb-2">Eyebrow Text</p>
                <p className="body-sm text-muted-foreground mb-2">
                  Small uppercase labels for categorization and metadata.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  className=&quot;eyebrow&quot;
                </code>
                <p className="body-sm text-muted-foreground mt-1">
                  Size: <code className="text-xs">text-xs</code> | Weight: <code className="text-xs">font-semibold</code> | Tracking: <code className="text-xs">tracking-[0.12em]</code>
                </p>
              </div>
            </div>

            {/* Usage Guidelines */}
            <div className="border-t pt-4">
              <h3 className="heading-sm mb-3">Usage Guidelines</h3>
              <ul className="space-y-2 body-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use semantic HTML: <code className="text-xs bg-muted px-1 py-0.5 rounded">h1</code> for page titles, <code className="text-xs bg-muted px-1 py-0.5 rounded">h2</code> for sections, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>H1 (heading-xl) uses <code className="text-xs bg-muted px-1 py-0.5 rounded">font-bold</code>, H2-H4 use <code className="text-xs bg-muted px-1 py-0.5 rounded">font-semibold</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>All typography classes use CSS variables for colors (<code className="text-xs bg-muted px-1 py-0.5 rounded">text-foreground</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">text-muted-foreground</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>For gradient backgrounds, apply typography classes and override color: <code className="text-xs bg-muted px-1 py-0.5 rounded">heading-xl text-white</code></span>
                </li>
              </ul>
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
          <h2 className="heading-md">Card System</h2>
          <div className="space-y-6">
            <div>
              <h3 className="heading-sm mb-3">Variants</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="card p-4 space-y-2">
                  <p className="heading-sm font-semibold">Default</p>
                  <p className="body-sm text-muted-foreground">
                    Standard card for most content blocks. Rounded-lg, shadow-sm.
                  </p>
                </div>
                <div className="card-elevated p-4 space-y-2">
                  <p className="heading-sm font-semibold">Elevated</p>
                  <p className="body-sm text-muted-foreground">
                    For emphasized content. Rounded-xl, shadow-lg for more prominence.
                  </p>
                </div>
                <div className="card-subtle p-4 space-y-2">
                  <p className="heading-sm font-semibold">Subtle</p>
                  <p className="body-sm text-muted-foreground">
                    For nested or secondary content. Muted background, reduced border opacity.
                  </p>
                </div>
                <div className="card-compact p-4 space-y-2">
                  <p className="heading-sm font-semibold">Compact</p>
                  <p className="body-sm text-muted-foreground">
                    For tight spaces, lists, or side panels. Smaller border radius.
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Default (.card):</strong> Use for standard content blocks, feature cards, and primary content areas. Border radius: rounded-lg (8px), shadow: shadow-sm.</p>
                <p><strong className="text-foreground">Elevated (.card-elevated):</strong> Use for hero cards, featured content, or when you need extra visual emphasis. Border radius: rounded-xl (12px), shadow: shadow-lg.</p>
                <p><strong className="text-foreground">Subtle (.card-subtle):</strong> Use for nested content, secondary information, or when you want minimal visual weight. Border radius: rounded-lg (8px), muted background.</p>
                <p><strong className="text-foreground">Compact (.card-compact):</strong> Use for lists, side panels, or when space is limited. Border radius: rounded-md (6px), same shadow as default.</p>
              </div>
            </div>

            <div>
              <h3 className="heading-sm mb-3">Usage Examples</h3>
              <div className="space-y-3 text-sm">
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  <div className="text-muted-foreground">{"<div className=\"card p-6\">"}</div>
                  <div className="ml-4">Content here</div>
                  <div className="text-muted-foreground">{"</div>"}</div>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  <div className="text-muted-foreground">{"<div className=\"card-elevated p-8\">"}</div>
                  <div className="ml-4">Featured content</div>
                  <div className="text-muted-foreground">{"</div>"}</div>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  <div className="text-muted-foreground">{"<div className=\"card-subtle p-4\">"}</div>
                  <div className="ml-4">Nested content</div>
                  <div className="text-muted-foreground">{"</div>"}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="heading-sm mb-3">Border Radius & Shadow Standards</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Border Radius:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code className="bg-muted px-1 rounded">rounded-md</code> (6px) - Compact cards</li>
                  <li><code className="bg-muted px-1 rounded">rounded-lg</code> (8px) - Default and subtle cards</li>
                  <li><code className="bg-muted px-1 rounded">rounded-xl</code> (12px) - Elevated cards</li>
                  <li><code className="bg-muted px-1 rounded">rounded-2xl</code> (16px) - Hero sections (special cases)</li>
                </ul>
                <p className="mt-3"><strong className="text-foreground">Shadows:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code className="bg-muted px-1 rounded">shadow-sm</code> - Default and subtle cards</li>
                  <li><code className="bg-muted px-1 rounded">shadow-lg</code> - Elevated cards</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="card-compact p-6 space-y-4">
          <h2 className="heading-md">Button System</h2>
          <div className="space-y-6">
            <div>
              <h3 className="heading-sm mb-3">Variants</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <button className="btn btn--primary">Primary</button>
                  <button className="btn btn--secondary">Secondary</button>
                  <button className="btn btn--ghost">Ghost</button>
                  <button className="btn btn--outline">Outline</button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Primary:</strong> Use for the main call-to-action on a page. Highest visual emphasis.</p>
                  <p><strong className="text-foreground">Secondary:</strong> Use for secondary actions that support the primary action.</p>
                  <p><strong className="text-foreground">Ghost:</strong> Use for tertiary actions or when you want minimal visual weight.</p>
                  <p><strong className="text-foreground">Outline:</strong> Use for actions that need clear boundaries but less emphasis than primary.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="heading-sm mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn btn--primary btn--sm">Small</button>
                <button className="btn btn--primary">Default</button>
                <button className="btn btn--primary btn--lg">Large</button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Small (btn--sm):</strong> px-3 py-1.5 text-xs - For compact spaces, tables, or inline actions</p>
                <p><strong className="text-foreground">Default:</strong> px-4 py-2 text-sm - Standard size for most use cases</p>
                <p><strong className="text-foreground">Large (btn--lg):</strong> px-6 py-3 text-base - For hero sections and prominent CTAs</p>
              </div>
            </div>

            <div>
              <h3 className="heading-sm mb-3">Usage Examples</h3>
              <div className="space-y-3 text-sm">
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  <div className="text-muted-foreground">{"<button className=\"btn btn--primary\">"}</div>
                  <div className="ml-4">Submit</div>
                  <div className="text-muted-foreground">{"</button>"}</div>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  <div className="text-muted-foreground">{"<Link href=\"/\" className=\"btn btn--primary btn--lg\">"}</div>
                  <div className="ml-4">Get Started</div>
                  <div className="text-muted-foreground">{"</Link>"}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="heading-sm mb-3">Semantic HTML</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Use {"<button>"} for:</strong> Actions that trigger JavaScript, form submissions, or in-page interactions</p>
                <p><strong className="text-foreground">Use {"<Link>"} or {"<a>"} for:</strong> Navigation to other pages or external URLs</p>
                <p className="text-xs">Always ensure buttons have accessible labels and proper ARIA attributes when needed.</p>
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
