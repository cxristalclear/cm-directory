import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, CheckCircle2, Globe2, ShieldCheck, TimerReset } from "lucide-react"

import Navbar from "@/components/navbar"
import JotformEmbed from "@/components/JotformEmbed"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "List Your Company | CM Directory",
  description:
    "List your contract manufacturing company for free on CM Directory. Reach qualified buyers, showcase your capabilities, certifications, and get featured placement options.",
  alternates: {
    canonical: `${siteConfig.url}/list-your-company`,
  },
  openGraph: {
    title: "List Your Company — CM Directory",
    description:
      "Get free visibility to qualified buyers. Showcase your manufacturing capabilities and connect with OEMs and engineers.",
    url: `${siteConfig.url}/list-your-company`,
    siteName: siteConfig.name,
    type: "website",
  },
  robots: { index: true, follow: true },
}

const steps = [
  {
    number: "1",
    title: "Submit your details",
    description: "Share your capabilities, certifications, locations, and contacts.",
    time: "5 minutes",
  },
  {
    number: "2",
    title: "We verify",
    description: "We review within 1–2 business days and validate your details.",
    time: "1–2 days",
  },
  {
    number: "3",
    title: "Go live",
    description: "Your profile is published and ready for qualified buyer inquiries.",
    time: "Immediate",
  },
]

const benefits = [
  {
    title: "Reach qualified buyers",
    description: "Be seen by OEMs, startups, and engineering teams looking for EMS partners.",
    icon: Globe2,
  },
  {
    title: "Free basic listing",
    description: "Publish your core profile at no cost; upgrade later for featured placement.",
    icon: CheckCircle2,
  },
  {
    title: "Highlight strengths",
    description: "Showcase capabilities, volumes, industries served, and specialty processes.",
    icon: ShieldCheck,
  },
  {
    title: "Fast onboarding",
    description: "Share details once; verification happens within two business days.",
    icon: TimerReset,
  },
]

const faqs = [
  {
    q: "How much does it cost to list my company?",
    a: "Basic listings are free and include your company profile, capabilities, certifications, and contact information. Featured placement options are available for extra visibility.",
  },
  {
    q: "What information do I need to provide?",
    a: "Company name, locations, capabilities (SMT, through-hole, box build, cable harness, testing), certifications (ISO, AS9100, ITAR), website, and contact.",
  },
  {
    q: "How long does verification take?",
    a: "We typically review and verify within 1–2 business days.",
  },
  {
    q: "Can I update my listing later?",
    a: "Yes. Request updates anytime; featured partners get priority updates.",
  },
  {
    q: "What is Featured Placement?",
    a: "Featured placement highlights your profile at the top of results with a badge, larger card, and homepage spotlight.",
  },
]

export default function ListYourCompanyPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <div className="page-shell">
        <Navbar />

        <section className="section--flush">
          <div className="gradient-bg text-white">
            <div className="page-container py-16 text-center md:py-20">
              <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                  <Building2 className="h-5 w-5 text-white" />
                  For Manufacturers
                </div>
                <h1 className="heading-xl text-white md:text-5xl">Get found by qualified buyers</h1>
                <p className="body-lg max-w-3xl text-blue-100">
                  List your contract manufacturing company for free and connect with OEMs, startups, and engineers
                  searching for reliable partners.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <Link href="#submit" className="btn btn--primary btn--lg bg-white text-primary hover:bg-white/90">
                    Submit Free Listing
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/contact" className="btn btn--outline btn--lg border-white/40 text-white hover:text-primary">
                    Have Questions?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="page-container section space-y-12">
          <section className="space-y-6">
            <h2 className="heading-lg">How it works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(step => (
                <div key={step.number} className="card">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="heading-md text-center">{step.title}</h3>
                  <p className="body text-muted-foreground text-center">{step.description}</p>
                  <div className="mt-3 flex justify-center">
                    <span className="chip chip--muted">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="submit" className="card space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="heading-lg">Submit your listing</h2>
              <p className="body-lg text-muted-foreground">
                Fill out the form and we&apos;ll review and publish within 1–2 business days.
              </p>
            </div>
            <JotformEmbed />
          </section>

          <section className="space-y-4">
            <h2 className="heading-lg">Why list on CM Directory?</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map(benefit => (
                <div key={benefit.title} className="card-compact flex gap-3">
                  <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="heading-md">{benefit.title}</h3>
                    <p className="body text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card space-y-4">
            <h2 className="heading-lg">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map(faq => (
                <details key={faq.q} className="card-compact group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-left">
                    <span className="heading-md">{faq.q}</span>
                    <span className="text-lg text-muted-foreground transition group-open:rotate-180">▾</span>
                  </summary>
                  <p className="body text-muted-foreground pt-2">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="card bg-primary text-primary-foreground text-center">
            <div className="space-y-4">
              <h2 className="heading-lg text-primary-foreground">Ready to get found?</h2>
              <p className="body-lg text-primary-foreground/80">
                Join manufacturers connecting with qualified buyers every day.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="#submit" className="btn btn--primary btn--lg bg-white text-primary hover:bg-white/90">
                  Submit Free Listing
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact" className="btn btn--outline btn--lg border-primary-foreground/30 text-primary-foreground">
                  Contact Sales
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Suspense>
  )
}
