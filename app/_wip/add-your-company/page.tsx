import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Building2, CheckCircle } from "lucide-react"

import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps, type JsonLd } from "@/lib/schema"
import Navbar from "@/components/navbar"

const benefits = [
  {
    title: "Reach purchasing teams early",
    description:
      "Get in front of electronics brands when they shortlist contract manufacturers for upcoming builds and RFQs.",
  },
  {
    title: "Stand out with verified data",
    description:
      "Showcase certifications, specialties, and build volumes so sourcing managers instantly see how you fit their project.",
  },
  {
    title: "No listing fees",
    description:
      "Submitting your profile is free. We only publish active, vetted EMS partners so buyers trust what they see.",
  },
]

const testimonials = [
  {
    quote:
      "We were fielding qualified PCB assembly opportunities within a week of updating our capabilities on CM Directory.",
    name: "Director of Business Development",
    company: "Precision Circuits Group",
  },
  {
    quote:
      "The intake process was simple and the team helped highlight the certifications that matter to medtech buyers.",
    name: "Operations Manager",
    company: "MedBuild EMS",
  },
]

const onboardingResources = [
  {
    title: "How we evaluate manufacturers",
    href: "/capabilities",
    description: "Understand the criteria and scoring rubrics buyers see on your profile.",
  },
  {
    title: "Certification spotlight program",
    href: "/certifications/iso-13485",
    description: "Learn how regulated industries use CM Directory filters to shortlist partners.",
  },
  {
    title: "Supplier success checklist",
    href: "/about",
    description: "Review expectations for response times, data accuracy, and collaboration.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const pageUrl = getCanonicalUrl("/add-your-company")

  return {
    title: "Why List Your Company on CM Directory | Benefits & Process",
    description:
      "Learn how listing your EMS company on CM Directory helps you reach vetted electronics brands, highlight capabilities, and win more programs. Free listing available.",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Why List Your EMS Company on CM Directory",
      description:
        "Discover the benefits of joining CM Directory to showcase certifications, capabilities, and connect with qualified electronics buyers.",
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: "Learn about listing on CM Directory",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Why List Your Company on CM Directory",
      description:
        "Learn how CM Directory helps manufacturers connect with qualified electronics buyers.",
      images: [
        {
          url: siteConfig.ogImage,
          alt: "CM Directory listing benefits",
        },
      ],
    },
  }
}

export default function AddYourCompanyPage() {
  const canonicalUrl = getCanonicalUrl("/add-your-company")

  const howToSchema: JsonLd<{
    "@type": "HowTo"
    name: string
    description: string
    step: Array<{
      "@type": "HowToStep"
      name: string
      text: string
      url: string
    }>
    publisher: {
      "@type": "Organization"
      name: string
      url: string
    }
    supply: Array<{
      "@type": "HowToSupply"
      name: string
    }>
    totalTime: string
  }> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to add your company to CM Directory",
    description:
      "Follow these quick steps to submit your electronics manufacturing business for inclusion on CM Directory.",
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    supply: [
      { "@type": "HowToSupply", name: "Company capability details" },
      { "@type": "HowToSupply", name: "Quality certifications" },
      { "@type": "HowToSupply", name: "Primary contact information" },
    ],
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        name: "Share core capabilities",
        text: "Provide your manufacturing services, volumes, and specializations.",
        url: `${canonicalUrl}#step-capabilities`,
      },
      {
        "@type": "HowToStep",
        name: "Upload certifications",
        text: "Attach relevant certifications such as ISO, ITAR, or FDA registrations so buyers can filter to your strengths.",
        url: `${canonicalUrl}#step-certifications`,
      },
      {
        "@type": "HowToStep",
        name: "Confirm review call",
        text: "Schedule a quick verification call with our team to publish your listing and unlock sourcing notifications.",
        url: `${canonicalUrl}#step-review`,
      },
    ],
  }

  return (
    <div className="page-shell">
      <script {...jsonLdScriptProps(howToSchema)} />
      <Navbar />

      <section className="section--flush">
        <div className="gradient-bg text-white">
          <div className="page-container py-16 text-center md:py-20">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <Building2 className="h-5 w-5 text-white" />
                For Manufacturers
              </div>
              <h1 className="heading-xl text-white md:text-5xl">Why List Your Company on CM Directory?</h1>
              <p className="body-lg max-w-3xl text-blue-100">
                Learn how CM Directory connects verified EMS partners with hardware companies that are ready to place
                production orders.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link href="/list-your-company" className="btn btn--primary btn--lg bg-white text-primary hover:bg-white/90">
                  Submit Free Listing
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact" className="btn btn--outline-primary btn--lg text-white hover:text-primary">
                  Have Questions?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="page-container section space-y-14">
        <section className="space-y-6">
          <h2 className="heading-lg">Benefits of Listing Your Company</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(benefit => (
              <div key={benefit.title} className="card-compact space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h3 className="heading-md">{benefit.title}</h3>
                </div>
                <p className="body text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-8 md:p-10 space-y-6">
          <h2 className="heading-lg">What You&apos;ll Need to Get Started</h2>
          <p className="body-lg text-muted-foreground">
            Before you begin the listing process, gather these key pieces of information to ensure a smooth submission:
          </p>
          <div className="space-y-4">
            <InfoBlock id="step-capabilities" title="Capabilities Snapshot">
              Prepare a summary of your manufacturing services including SMT, through-hole, cable harness, box build,
              testing, and other capabilities. This helps buyers quickly understand your best-fit work.
            </InfoBlock>
            <InfoBlock id="step-certifications" title="Quality Certifications">
              Have your quality certificates ready (ISO 9001, ISO 13485, AS9100, ITAR, etc.). You&apos;ll be able to upload
              these or provide references so buyers can verify your compliance credentials.
            </InfoBlock>
            <InfoBlock id="step-review" title="Primary Contact Information">
              Designate a point of contact for our brief verification call and for receiving future sourcing notifications
              from qualified buyers.
            </InfoBlock>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="heading-lg">The Listing Process</h2>
          <ol className="space-y-6">
            <Step number={1} title="Submit Your Information">
              Complete the listing form with your company details, capabilities, certifications, and contact information.
              The process typically takes 10-15 minutes.
            </Step>
            <Step number={2} title="We Review &amp; Verify">
              Our team reviews your submission within two business days. We&apos;ll reach out with any clarifying questions
              and schedule a brief onboarding call to verify capabilities and certifications.
            </Step>
            <Step number={3} title="Go Live &amp; Start Connecting">
              Once published, your profile goes live on CM Directory. You can update your information anytime and you&apos;ll
              receive alerts when qualified buyers request introductions.
            </Step>
          </ol>
        </section>

        <section className="space-y-6">
          <h2 className="heading-lg">What Manufacturers Say</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map(testimonial => (
              <figure key={testimonial.company} className="card-compact space-y-3">
                <blockquote className="body text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <figcaption className="text-sm">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground">{testimonial.company}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="heading-lg">Helpful Resources</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {onboardingResources.map(resource => (
              <Link
                key={resource.href}
                href={resource.href}
                className="card-compact group space-y-2 transition hover:border-primary/50 hover:shadow-md"
              >
                <h3 className="heading-md group-hover:text-primary">{resource.title}</h3>
                <p className="body text-muted-foreground">{resource.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card bg-primary text-primary-foreground text-center">
          <div className="space-y-4">
            <h2 className="heading-lg text-primary-foreground">Ready to List Your Company?</h2>
            <p className="body-lg text-primary-foreground/80">
              Start the listing process and get your company in front of qualified buyers searching for manufacturing partners.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/list-your-company" className="btn btn--primary btn--lg bg-white text-primary hover:bg-white/90">
                Submit Free Listing
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn btn--outline btn--lg border-primary-foreground/30 text-primary-foreground">
                Have Questions?
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function InfoBlock({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="card-compact bg-card">
      <h3 className="heading-md">{title}</h3>
      <p className="body text-muted-foreground">{children}</p>
    </div>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="card-compact flex gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
        {number}
      </div>
      <div className="space-y-2">
        <h3 className="heading-md">{title}</h3>
        <p className="body text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}
