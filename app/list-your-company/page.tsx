import { Suspense } from "react"
import type { Metadata } from "next"
import { ArrowRight, Building2, CheckCircle2, Globe2, ShieldCheck, TimerReset } from "lucide-react"

import Navbar from "@/components/navbar"
import JotformEmbed from "@/components/JotformEmbed"
import { siteConfig } from "@/lib/config"
import { ContactSalesButton, SubmitFormButton } from "./TrackingButtons"

const siteName = siteConfig.name

export const metadata: Metadata = {
  title: `List Your Company | ${siteName}`,
  description:
    `List your contract manufacturing company for free on ${siteName}. Reach qualified buyers, showcase your capabilities, certifications, and get featured placement options.`,
  alternates: {
    canonical: `${siteConfig.url}/list-your-company`,
  },
  openGraph: {
    title: `List Your Company — ${siteName}`,
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

        <main className="page-container section">
          {/* Hero Section - Centered Light Theme */}
          <section className="text-center max-w-4xl mx-auto pt-12 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mx-auto">
              <Building2 className="h-4 w-4 text-primary" />
              <span>For Manufacturers</span>
            </div>
            <h1 className="heading-xl text-foreground">
              Get found by <span className="text-primary">qualified buyers</span>.
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              List your contract manufacturing company for free and connect with OEMs, startups, and engineers searching for reliable partners.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <SubmitFormButton className="btn btn--primary btn--lg shadow-md shadow-primary/20">
                Submit Free Listing
                <ArrowRight className="h-4 w-4 ml-2" />
              </SubmitFormButton>
              <ContactSalesButton className="btn btn--outline btn--lg bg-card">
                Have Questions?
              </ContactSalesButton>
            </div>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-lg mb-4">How it works</h2>
              <p className="body text-muted-foreground">Three simple steps to publish your profile.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative card p-6 rounded-xl">
                  <div className="absolute -top-5 left-6 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ring-4 ring-background">
                    {step.number}
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="heading-md">{step.title}</h3>
                    <p className="body-sm text-muted-foreground">{step.description}</p>
                    <div className="pt-2">
                      <span className="chip chip--muted">{step.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form Section */}
          <section id="submit" className="mb-16 max-w-3xl mx-auto">
            <div className="card-elevated p-1 border-border/60">
              <div className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="heading-lg">Submit your listing</h2>
                  <p className="body text-muted-foreground">
                    Fill out the form and we&apos;ll review and publish within 1–2 business days.
                  </p>
                </div>
                <JotformEmbed />
              </div>
            </div>
          </section>

          {/* Benefits & FAQ Split */}
          <section className="mb-16 grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="heading-lg mb-6">Why list on {siteName}?</h2>
              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="heading-sm text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* FAQ Accordion */}
            <div className="bg-muted/30 rounded-2xl p-6 md:p-8">
              <h3 className="heading-md mb-6">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group card open:shadow-sm transition-all">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                      {faq.q}
                      <span className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-transparent group-open:border-border/50 pt-0 group-open:pt-3">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Footer */}
          <section className="card bg-primary text-primary-foreground p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="heading-lg text-white">Ready to get found?</h2>
              <p className="body-lg text-primary-foreground/90">
                Join manufacturers connecting with qualified buyers every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SubmitFormButton className="btn btn--lg bg-white text-primary hover:bg-white/90 border-none w-full sm:w-auto">
                  Submit Free Listing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </SubmitFormButton>
                <ContactSalesButton className="btn btn--lg btn--outline border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  Contact Sales
                </ContactSalesButton>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Suspense>
  )
}
