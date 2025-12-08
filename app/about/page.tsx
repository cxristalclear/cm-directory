import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Search
} from "lucide-react"

import Navbar from "@/components/navbar"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "About | Contract Manufacturer Directory",
  description:
    "Engineer-focused resource for discovering U.S. electronics contract manufacturers by capabilities, certifications, industries, and capacity faster.",
}

const heroStats = [
  { label: "Vetted manufacturers", value: "842+", trend: "+127 this quarter" },
  { label: "Monthly searches", value: "18k+", trend: "+34% vs last year" },
  { label: "Cert accuracy", value: "95%+", trend: "Verified quarterly" },
]

const personas = [
  {
    title: "Engineers",
    icon: Wrench,
    copy: "Prove capability fit for complex assemblies, fine-pitch BGAs, and test.",
    proof: "Cut shortlist time from 2 weeks to 2 days.",
    metric: { value: 86, label: "Avg match score" },
    color: "text-blue-600 bg-blue-50",
    barColor: "bg-blue-600"
  },
  {
    title: "Procurement",
    icon: ClipboardCheck,
    copy: "Validate certifications and compliance before you engage.",
    proof: "90% of profiles refreshed every 90 days.",
    metric: { value: 90, label: "Data freshness" },
    color: "text-purple-600 bg-purple-50",
    barColor: "bg-purple-600"
  },
  {
    title: "Project Managers",
    icon: Calendar,
    copy: "See capacity, lead times, and contacts before you commit.",
    proof: "30% faster onboarding on average.",
    metric: { value: 30, label: "Time saved" },
    color: "text-emerald-600 bg-emerald-50",
    barColor: "bg-emerald-600"
  },
]

const steps = [
  {
    number: "01",
    title: "Search & filter",
    desc: "Use capabilities, certs, industries, and geography to narrow the field.",
    icon: Search,
    action: "Try search",
  },
  {
    number: "02",
    title: "Compare profiles",
    desc: "Cert freshness, equipment, volumes, and contacts side by side.",
    icon: Sparkles,
    action: "View example",
  },
  {
    number: "03",
    title: "Engage partners",
    desc: "Share lists or request intros when you are confident in the fit.",
    icon: ShieldCheck,
    action: "See how",
  },
]

const trustSignals = [
  { 
    title: "Data accuracy", 
    value: "95%", 
    desc: "Certification and contact accuracy target.",
    progress: 95,
    icon: Target,
    updated: "Updated daily",
  },
  { 
    title: "Verification cadence", 
    value: "90 days", 
    desc: "Rolling refresh on core fields.",
    progress: 75,
    icon: Clock,
    updated: "Last run: Nov 23",
  },
]

const benefits = [
  { icon: TrendingUp, text: "Featured badge and priority ranking" },
  { icon: ShieldCheck, text: "Verified certifications displayed" },
  { icon: Globe2, text: "Up-to-date capabilities and locations" },
  { icon: Users, text: "Direct buyer inquiries routed to you" },
]

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container section space-y-24">
        
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center pt-8">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>The Contract Manufacturer Directory</span>
              </div>
              
              <h1 className="heading-xl text-foreground">
                Find verified electronics CMs in <span className="text-primary">days, not weeks</span>.
              </h1>
              
              <p className="body-lg text-muted-foreground max-w-xl">
                The engineer-first platform to discover, vet, and connect with US-based electronics manufacturers. Filter by capabilities, certifications, and real-time capacity.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/" className="btn btn--primary btn--lg shadow-md shadow-primary/20">
                Browse Directory
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/list-your-company"
                className="btn btn--outline btn--lg bg-card"
              >
                List Your Company
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: UI Preview */}
          <div className="relative lg:pl-10">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
            
            <div className="card p-6 shadow-xl border-border/60 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Interactive Search</div>
                    <div className="text-xs text-muted-foreground">Real-time filtering</div>
                  </div>
                </div>
                <span className="chip chip--primary text-xs">Live Preview</span>
              </div>

              {/* Fake Filter Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['ISO 13485', 'SMT Assembly', 'Texas', 'Medical'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground border border-transparent hover:border-border hover:bg-background cursor-pointer transition-all">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Fake Results */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">Orion Electronics</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Austin, TX</div>
                    </div>
                    <Award className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">AS9100</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Box Build</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">Bright Circuit Labs</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Dallas, TX</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">ISO 9001</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Cable Harness</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-2xl">
              <h2 className="heading-lg mb-3">Trusted by the industry</h2>
              <p className="body text-muted-foreground">
                Whether you are designing the board or sourcing the build, we have the data you need to make confident decisions.
              </p>
            </div>
            <Link href="/search" className="btn btn--ghost group">
              View all features <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <div key={persona.title} className="card p-6 hover:border-primary/40 transition-colors group">
                <div className={`h-10 w-10 rounded-lg ${persona.color} flex items-center justify-center mb-4`}>
                  <persona.icon className="h-5 w-5" />
                </div>
                <h3 className="heading-md mb-2">{persona.title}</h3>
                <p className="body-sm text-muted-foreground mb-6 h-10">{persona.copy}</p>
                
                <div className="pt-6 border-t border-border">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{persona.metric.label}</span>
                    <span className="text-lg font-bold text-foreground">{persona.metric.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${persona.barColor}`} style={{ width: `${persona.metric.value}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {persona.proof}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 -mx-5 px-5 py-20 md:rounded-3xl">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="heading-lg mb-4">How it works</h2>
            <p className="body text-muted-foreground">
              A streamlined process designed to move you from discovery to RFQ without the friction.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connector Line */}
            <div className="absolute top-8 left-0 w-full h-0.5 bg-border hidden md:block" />

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.title} className="relative bg-card p-6 rounded-xl border border-border shadow-sm z-10">
                  <div className="absolute -top-5 left-6 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ring-4 ring-background">
                    {step.number}
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="heading-md">{step.title}</h3>
                    <p className="body-sm text-muted-foreground">{step.desc}</p>
                    <div className="pt-2">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 cursor-pointer hover:underline">
                        {step.action} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Quality Section */}
        <section className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="heading-lg">Quality you can trust</h2>
            <p className="body text-muted-foreground">
              We don&apos;t scrape the web blindly. Every manufacturer in our directory is verified against state business registries, ISO databases, and direct outreach.
            </p>
            <div className="space-y-4">
              {trustSignals.map(signal => (
                <div key={signal.title} className="card-compact p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <signal.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-semibold text-foreground">{signal.title}</h4>
                      <span className="text-sm font-bold text-primary">{signal.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{signal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 mb-6">
                  <Users className="h-3 w-3" />
                  For Manufacturers
                </div>
                <h3 className="heading-lg text-white mb-4">Claim your profile</h3>
                <p className="text-blue-100 mb-8 max-w-md leading-relaxed">
                  Join 800+ manufacturers who use {siteConfig.name} to reach qualified buyers. Verification is free and takes less than 24 hours.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {benefits.map(benefit => (
                    <li key={benefit.text} className="flex items-center gap-3 text-sm text-blue-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                href="/list-your-company" 
                className="relative z-10 w-full sm:w-auto btn btn--lg bg-white text-slate-900 hover:bg-blue-50 border-none self-start"
              >
                Start Free Listing
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Contract Manufacturer Directory is an independent resource powered by{" "}
            <a
              href="https://www.venkel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary underline decoration-dotted underline-offset-4 transition-colors"
            >
              Venkel Ltd.
            </a>
          </p>
        </footer>

      </main>
    </div>
  )
}
