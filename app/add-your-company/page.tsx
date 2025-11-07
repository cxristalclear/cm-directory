import Link from "next/link"
import type { Metadata } from "next"

<<<<<<< HEAD
import AddCompanyButton from "@/components/AddCompanyButton"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps, type JsonLd } from "@/lib/schema"
import { Building2 } from "lucide-react"
=======
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { jsonLdScriptProps, type JsonLd } from "@/lib/schema"
import { Building2, CheckCircle, ArrowRight } from "lucide-react"
>>>>>>> 12f2bb7 (temp: bring in local work)

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
<<<<<<< HEAD
    title: "Add Your Manufacturing Company | CM Directory",
    description:
      "Submit your EMS company to CM Directory to reach vetted electronics brands, highlight capabilities, and win more programs.",
=======
    title: "Why List Your Company on CM Directory | Benefits & Process",
    description:
      "Learn how listing your EMS company on CM Directory helps you reach vetted electronics brands, highlight capabilities, and win more programs. Free listing available.",
>>>>>>> 12f2bb7 (temp: bring in local work)
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
<<<<<<< HEAD
      title: "List Your EMS Company on CM Directory",
      description:
        "Join CM Directory to showcase certifications, capabilities, and win qualified electronics manufacturing opportunities.",
=======
      title: "Why List Your EMS Company on CM Directory",
      description:
        "Discover the benefits of joining CM Directory to showcase certifications, capabilities, and connect with qualified electronics buyers.",
>>>>>>> 12f2bb7 (temp: bring in local work)
      type: "website",
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
<<<<<<< HEAD
          alt: "Submit your EMS company to CM Directory",
=======
          alt: "Learn about listing on CM Directory",
>>>>>>> 12f2bb7 (temp: bring in local work)
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
<<<<<<< HEAD
      title: "Add Your Company to CM Directory",
      description:
        "Complete the submission form to appear in front of electronics brands sourcing manufacturing partners.",
      images: [
        {
          url: siteConfig.ogImage,
          alt: "CM Directory listing submission",
=======
      title: "Why List Your Company on CM Directory",
      description:
        "Learn how CM Directory helps manufacturers connect with qualified electronics buyers.",
      images: [
        {
          url: siteConfig.ogImage,
          alt: "CM Directory listing benefits",
>>>>>>> 12f2bb7 (temp: bring in local work)
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
    url: string
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
      {
        "@type": "HowToSupply",
        name: "Company capability details",
      },
      {
        "@type": "HowToSupply",
        name: "Quality certifications",
      },
      {
        "@type": "HowToSupply",
        name: "Primary contact information",
      },
    ],
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        name: "Share core capabilities",
<<<<<<< HEAD
        text: "Launch the Add Your Company form and provide your manufacturing services, volumes, and specializations.",
=======
        text: "Provide your manufacturing services, volumes, and specializations.",
>>>>>>> 12f2bb7 (temp: bring in local work)
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
    <div className="min-h-screen bg-gray-50">
      <script {...jsonLdScriptProps(howToSchema)} />

      <section className="relative overflow-hidden">
<<<<<<< HEAD
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
                        <Link
                          href="/"
                          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                        >
                          Back to Directory
                        </Link>
                        <Link
                          href="/add-your-company"
                          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                        >
                          Add Your Company
                      </Link>
                      </div>
                    </div>
                  </div>
                </nav>
      
                {/* Hero copy */}
                <div className="relative z-10 py-12 md:py-16 text-center">
                  <div className="container mx-auto px-4">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-blue-100">
                      Become a verified supplier
                    </span>
                    <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold leading-tight text-white md:text-5xl">
                      Showcase your manufacturing team to electronics innovators
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-blue-100">
                CM Directory connects vetted EMS partners with hardware companies that are ready to place production orders. Share what you build, highlight compliance credentials, and win programs that match your line capabilities.
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

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-6">
              <ul className="grid gap-4 sm:grid-cols-2">
                {benefits.map(benefit => (
                  <li
                    key={benefit.title}
                    className="rounded-lg bg-white/10 p-4 text-sm text-blue-50 backdrop-blur"
                  >
                    <p className="font-semibold text-white">{benefit.title}</p>
                    <p className="mt-2 text-blue-100">{benefit.description}</p>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-4">
                <AddCompanyButton className="text-base" />
                <p className="text-sm text-blue-100">
                  Need help? Read our
                  {" "}
                  <Link href="#resources" className="font-medium text-white underline">
                    onboarding guidance
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="space-y-6 rounded-2xl bg-white/10 p-6 backdrop-blur">
              <h2 className="text-xl font-semibold">What to prepare</h2>
              <div className="space-y-4 text-sm text-blue-50">
                <div id="step-capabilities">
                  <p className="font-semibold text-white">Capabilities snapshot</p>
                  <p className="mt-2 text-blue-100">
                    Summarize SMT, THT, cable harness, box build, testing, and other services so buyers understand your best-fit work.
                  </p>
                </div>
                <div id="step-certifications">
                  <p className="font-semibold text-white">Quality proof points</p>
                  <p className="mt-2 text-blue-100">
                    Upload certificates or audit letters for ISO, ITAR, AS9100, or industry-specific programs.
                  </p>
                </div>
                <div id="step-review">
                  <p className="font-semibold text-white">Verification contact</p>
                  <p className="mt-2 text-blue-100">
                    Provide a responsive point of contact for a short review call and future sourcing notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-900">Why suppliers choose CM Directory</h2>
              <p className="text-lg text-gray-600">
                We spotlight verified EMS partners and give buyers confidence to shortlist you. Profiles surface the metrics that sourcing teams care about most.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {benefits.map(benefit => (
                  <div key={benefit.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="mt-3 text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-900">What happens after you submit?</h2>
              <ol className="space-y-4 border-l-2 border-blue-200 pl-6 text-gray-700">
                <li className="relative">
                  <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    1
                  </span>
                  Our team reviews your submission within two business days and reaches out with any clarifying questions.
                </li>
                <li className="relative">
                  <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    2
                  </span>
                  We schedule a short onboarding call to verify capabilities, certifications, and ideal project fit.
                </li>
                <li className="relative">
                  <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    3
                  </span>
                  Once published, you can update data anytime and receive alerts when qualified buyers request introductions.
                </li>
              </ol>
            </section>
          </div>

          <aside className="space-y-10">
            <section
              id="resources"
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Supplier testimonials</h2>
              <div className="mt-6 space-y-6">
                {testimonials.map(testimonial => (
                  <figure key={testimonial.company} className="rounded-lg bg-gray-50 p-6">
                    <blockquote className="text-gray-700">“{testimonial.quote}”</blockquote>
                    <figcaption className="mt-4 text-sm font-medium text-gray-900">
                      {testimonial.name} · {testimonial.company}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Helpful resources</h2>
              <ul className="mt-4 space-y-4">
                {onboardingResources.map(resource => (
                  <li key={resource.href}>
                    <Link href={resource.href} className="group flex flex-col rounded-lg border border-transparent p-3 transition hover:border-blue-500 hover:bg-blue-50">
                      <span className="font-semibold text-blue-700 group-hover:text-blue-900">
                        {resource.title}
                      </span>
                      <span className="text-sm text-gray-600">{resource.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <div className="bg-blue-900">
        <div className="container mx-auto px-4 py-12 text-white">
          <div className="flex flex-col gap-6 rounded-2xl bg-blue-800/60 p-8 text-center shadow-lg backdrop-blur sm:p-12">
            <h2 className="text-3xl font-semibold">Ready to join the directory?</h2>
            <p className="text-lg text-blue-100">
              Submit your company profile today and connect with buyers who need reliable manufacturing partners.
            </p>
            <div className="flex justify-center">
              <AddCompanyButton className="text-base" />
            </div>
          </div>
=======
        <div className="gradient-bg">
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
                  <Link href="/" className="text-sm font-medium text-white/90 hover:text-white">
                    Back to Directory
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="relative z-10 py-16 md:py-20">
            <div className="container mx-auto px-4 text-center">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-blue-100 mb-6">
                For Manufacturers
              </span>
              <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold leading-tight text-white md:text-5xl mb-6">
                Why List Your Company on CM Directory?
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-blue-100 mb-8">
                Learn how CM Directory connects verified EMS partners with hardware companies that are ready to place production orders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/list-your-company"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Submit Free Listing
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg bg-blue-700/50 px-8 py-4 text-md font-medium text-white backdrop-blur-sm transition-all hover:bg-blue-700/30"
                >
                  Have Questions?
                </Link>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          
          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Benefits of Listing Your Company</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map(benefit => (
                <div key={benefit.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-10">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">What You'll Need to Get Started</h2>
            <p className="text-lg text-gray-700 mb-8">
              Before you begin the listing process, gather these key pieces of information to ensure a smooth submission:
            </p>
            <div className="space-y-6">
              <div id="step-capabilities" className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📋 Capabilities Snapshot</h3>
                <p className="text-gray-600 leading-relaxed">
                  Prepare a summary of your manufacturing services including SMT, through-hole, cable harness, box build, testing, and other capabilities. This helps buyers quickly understand your best-fit work.
                </p>
              </div>
              
              <div id="step-certifications" className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🏆 Quality Certifications</h3>
                <p className="text-gray-600 leading-relaxed">
                  Have your quality certificates ready (ISO 9001, ISO 13485, AS9100, ITAR, etc.). You'll be able to upload these or provide references so buyers can verify your compliance credentials.
                </p>
              </div>
              
              <div id="step-review" className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">👤 Primary Contact Information</h3>
                <p className="text-gray-600 leading-relaxed">
                  Designate a point of contact for our brief verification call and for receiving future sourcing notifications from qualified buyers.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">The Listing Process</h2>
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    1
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Complete the listing form with your company details, capabilities, certifications, and contact information. The process typically takes 10-15 minutes.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    2
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">We Review & Verify</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our team reviews your submission within two business days. We'll reach out with any clarifying questions and schedule a brief onboarding call to verify capabilities and certifications.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    3
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Go Live & Start Connecting</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Once published, your profile goes live on CM Directory. You can update your information anytime and you'll receive alerts when qualified buyers request introductions.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">What Manufacturers Say</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map(testimonial => (
                <figure key={testimonial.company} className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                  <blockquote className="text-gray-700 leading-relaxed mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <figcaption className="text-sm">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.company}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Helpful Resources</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {onboardingResources.map(resource => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {resource.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 md:p-10 text-center text-white">
            <h2 className="text-3xl font-semibold mb-4">Ready to List Your Company?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Start the listing process and get your company in front of qualified buyers searching for manufacturing partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/list-your-company"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Submit Free Listing
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-800"
              >
                Have Questions?
              </Link>
            </div>
          </section>

>>>>>>> 12f2bb7 (temp: bring in local work)
        </div>
      </div>
    </div>
  )
}
