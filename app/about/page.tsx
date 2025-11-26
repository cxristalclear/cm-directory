// app/about/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, CheckCircle2, Map, ShieldCheck, Sparkles } from "lucide-react"

import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "About | Contract Manufacturer Directory",
  description:
    "Engineer-focused resource for discovering U.S. electronics contract manufacturers by capabilities, certifications, industries, and capacity faster.",
}

const personas = [
  { title: "Engineers", copy: "Evidence a CM can build complex assemblies, fine-pitch BGAs, and specialized testing." },
  { title: "Procurement", copy: "Qualify suppliers against certifications, compliance, and reliability." },
  { title: "Project Managers", copy: "Find partners with the right capacity and predictable lead times." },
]

const steps = [
  { title: "Interactive Map", desc: "Explore regions and facilities; zoom to the details that matter.", icon: Map },
  {
    title: "Advanced Filters",
    desc: "Capabilities, industries, and certifications including ISO 9001, ISO 13485, AS9100, ITAR, FDA.",
    icon: Sparkles,
  },
  {
    title: "Detailed Profiles",
    desc: "Capability matrices, equipment, feature sizes, cert expirations, lead times, MOQs, and contacts.",
    icon: ShieldCheck,
  },
]

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <section className="section--flush">
        <div className="gradient-bg text-white">
          <div className="page-container py-14 text-center md:py-16">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <Building2 className="h-5 w-5 text-white" />
                Contract Manufacturer Directory
              </div>
              <h1 className="heading-xl text-white md:text-5xl">About Contract Manufacturer Directory</h1>
              <p className="body-lg max-w-3xl text-blue-100">
                We help engineers, procurement, and project teams find electronics contract manufacturers that fit
                specific requirements—reducing selection time from weeks to hours.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link href="/" className="btn btn--primary btn--lg bg-white text-primary hover:bg-white/90">
                  Back to Directory
                </Link>
                <Link href="/list-your-company" className="btn btn--outline btn--lg border-white/40 text-white hover:text-primary">
                  Add Your Company
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="page-container section space-y-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card>
              <SectionHeader title="Who it’s for" />
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {personas.map(persona => (
                  <li key={persona.title} className="card-compact bg-muted/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <p className="heading-md">{persona.title}</p>
                    </div>
                    <p className="body text-muted-foreground">{persona.copy}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <SectionHeader title="How it works" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {steps.map(step => (
                  <div key={step.title} className="card-compact bg-muted/40">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-primary" />
                      <h3 className="heading-md">{step.title}</h3>
                    </div>
                    <p className="body text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeader title="Quality you can trust" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card-compact bg-muted/40">
                  <h4 className="heading-md">Data accuracy</h4>
                  <p className="body text-muted-foreground">95%+ accuracy target on certifications and contact info.</p>
                </div>
                <div className="card-compact bg-muted/40">
                  <h4 className="heading-md">Coverage depth</h4>
                  <p className="body text-muted-foreground">80%+ completion across core fields and rolling 90-day verification.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <AsideCard>
              <h3 className="heading-md text-foreground">For Contract Manufacturers</h3>
              <p className="body text-muted-foreground">
                Claim your profile to reach qualified buyers, highlight differentiators, and participate in partner tiers
                that add visibility and insights as the ecosystem expands.
              </p>
              <Link href="/list-your-company" className="btn btn--primary btn--block mt-3">
                Claim your profile
              </Link>
              <div className="mt-4 rounded-lg border-2 border-dashed border-border bg-muted/60 p-4 text-center text-sm text-muted-foreground">
                Sponsored Content / Featured Manufacturer
                <div className="mt-1 text-[11px]">728 × 90 — Advertisement</div>
              </div>
            </AsideCard>

            <AsideCard>
              <h3 className="heading-md text-foreground">Have feedback?</h3>
              <p className="body text-muted-foreground">
                Tell us what capabilities, certifications, or filters would make your search faster and more precise.
              </p>
              <Link href="/contact" className="btn btn--outline-primary btn--block mt-3">
                Submit Feedback
              </Link>
            </AsideCard>
          </div>
        </div>

        <footer className="section--tight">
          <div className="card-compact text-center text-sm text-muted-foreground">
            Contract Manufacturer Directory is an independent resource{" "}
            <a
              href="https://www.venkel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              powered by Venkel Ltd.
            </a>
            .
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ---------- Presentational helpers ---------- */
function Card({ children }: { children: React.ReactNode }) {
  return <section className="card space-y-2">{children}</section>
}

function AsideCard({ children }: { children: React.ReactNode }) {
  return <aside className="card-compact space-y-2">{children}</aside>
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="heading-lg">{title}</h2>
    </div>
  )
}
