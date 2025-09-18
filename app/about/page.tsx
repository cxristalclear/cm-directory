// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Contract Manufacturer Directory",
  description:
    "Engineer-focused resource for discovering U.S. electronics contract manufacturers by capabilities, certifications, industries, and capacity—fast.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* HERO + NAV (styled to match site header) */}
      <section className="relative overflow-hidden">
        <div className="gradient-bg">
          {/* Top nav with home link */}
          <nav className="relative z-10 border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-sans text-xl font-bold text-white">CM Directory</h1>
                    <p className="text-xs text-blue-100">Manufacturing Network</p>
                  </div>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                 <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                    Add Your Company
                  </button>
                  <Link
                    href="/"
                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    Back to Directory
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero copy */}
          <div className="relative z-10 py-12 md:py-16 text-center">
            <div className="container mx-auto px-4">
              <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold leading-tight text-white md:text-5xl">
                About Contract Manufacturer Directory
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-blue-100">
                We help engineers, procurement, and project teams find electronics contract manufacturers that fit
                specific requirements—reducing selection time from weeks to hours.
              </p>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* QUICK STATS
      <section className="-mt-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Verified Facilities" value="10+" />
          <StatCard label="Filterable Fields" value="40+" />
          <StatCard label="Update Cadence" value="90-day cycle" />
        </div>
      </section>*/}

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-8">
            <Card>
              <SectionTitle title="Who it’s for" />
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                <li className="flex flex-col gap-2">
                    <span className="w-fit"><Badge>Engineers</Badge></span>
                    <p className="text-neutral-700">
                    Evidence a CM can build complex assemblies, fine-pitch BGAs, and specialized testing.
                    </p>
                </li>

                <li className="flex flex-col gap-2">
                    <span className="w-fit"><Badge>Procurement</Badge></span>
                    <p className="text-neutral-700">
                    Qualify suppliers against certifications, compliance, and reliability.
                    </p>
                </li>

                <li className="flex flex-col gap-2">
                    <span className="w-fit"><Badge>Project Managers</Badge></span>
                    <p className="text-neutral-700">
                    Find partners with the right capacity and predictable lead times.
                    </p>
                </li>
                </ul>
            </Card>

            <Card>
              <SectionTitle title="How it works" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Feature title="Interactive Map" desc="Explore regions and facilities; zoom to the details that matter." />
                <Feature
                  title="Advanced Filters"
                  desc="Capabilities (SMT, box build, testing), industries (medical, aerospace/defense, automotive, industrial), and certifications (ISO 9001, ISO 13485, AS9100, ITAR, FDA)."
                />
                <Feature
                  title="Detailed Profiles"
                  desc="Capability matrices, equipment, minimum feature sizes, cert expirations, lead times, MOQs, and contacts."
                />
                <Feature title="Compare & Export (roadmap)" desc="Side-by-side comparison and export for reviews." />
              </div>
            </Card>

            <Card>
              <SectionTitle title="Quality you can trust" />
              <p className="mt-4 text-neutral-700">
                We emphasize accurate, current data and meaningful technical detail so you can qualify partners with
                confidence. Targeting 95%+ accuracy on certifications and contact info, 80%+ completion across core
                fields, and verification on a rolling 90-day cycle. Companies will be able to self-update profiles with
                safeguards in a later phase.
              </p>
            </Card>

            <Card>
              <SectionTitle title="Roadmap" />
              <ol className="mt-6 space-y-4">
                <TimelineItem title="NOW" body="Map, filters, and deep profiles for speed and relevance." />
                <TimelineItem
                  title="Near-Term"
                  body="Comparison, favorites, and self-service updates."
                />
                <TimelineItem title="Ongoing" body="Data depth, coverage expansion, and verification tooling." />
              </ol>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-4">
            <AsideCard>
              <h3 className="text-lg font-semibold text-neutral-900">For Contract Manufacturers</h3>
              <p className="mt-2 text-neutral-700">
                Claim your profile to reach qualified buyers, highlight differentiators, and participate in partner
                tiers that add visibility and insights as the ecosystem expands.
              </p>
              <div className="mt-4 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-100/60 p-4 text-center text-sm text-neutral-500">
                Sponsored Content / Featured Manufacturer
                <div className="mt-1 text-[11px]">728 × 90 – Advertisement</div>
              </div>
            </AsideCard>

            <AsideCard>
              <h3 className="text-lg font-semibold text-neutral-900">Have feedback?</h3>
              <p className="mt-2 text-neutral-700">
                Tell us what capabilities, certifications, or filters would make your search faster and more precise.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Submit Feedback
              </Link>
            </AsideCard>
          </div>
        </div>
      </section>

      {/* PAGE-SCOPED ATTRIBUTION (About only) */}
      <footer className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-600 shadow-sm">
          Contract Manufacturer Directory is an independent resource{" "}
          <a
            href="https://www.venkel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline decoration-dotted underline-offset-4 hover:text-neutral-800"
          >
            powered by Venkel Ltd.
          </a>
          .
        </div>
      </footer>
    </main>
  );
}

/* ---------- Presentational helpers ---------- */
function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</section>;
}
function AsideCard({ children }: { children: React.ReactNode }) {
  return <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</aside>;
}
function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h2>;
}
function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
      <h3 className="font-medium text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{desc}</p>
    </div>
  );
}
function Badge({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 " +
        className
      }
    >
      {children}
    </span>
  );
}

{/*
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
*/}

function TimelineItem({ title, body }: { title: string; body: string }) {
  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
      <div className="text-sm font-medium text-neutral-900">{title}</div>
      <p className="mt-1 text-neutral-700">{body}</p>
    </li>
  );
}