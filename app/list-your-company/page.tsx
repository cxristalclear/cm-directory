import { Suspense } from "react"
import { Metadata } from "next"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config"
import JotformEmbed from "@/components/JotformEmbed"

export const metadata: Metadata = {
  title: "List Your Company – Free Contract Manufacturer Directory Listing | CM Directory",
  description:
    "List your contract manufacturing company for free on CM Directory. Reach qualified buyers, showcase your capabilities, certifications, and get featured placement options.",
  alternates: {
    canonical: `${siteConfig.url}/list-your-company`
  },
  openGraph: {
    title: "List Your Company – CM Directory",
    description:
      "Get free visibility to qualified buyers. Showcase your manufacturing capabilities and connect with OEMs and engineers.",
    url: `${siteConfig.url}/list-your-company`,
    siteName: siteConfig.name,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'ai-summary': 'List your contract manufacturing company for free on CM Directory. Get discovered by qualified buyers searching for PCB assembly, box build, and cable harness manufacturing services.',
  }
}

// JSON-LD Schema
function generateJSONLD() {
  const schemas = [
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'List Your Company',
      'url': `${siteConfig.url}/list-your-company`,
      'description': 'List your contract manufacturing company for free and connect with qualified buyers'
    },
    // BreadcrumbList Schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteConfig.url
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'List Your Company',
          'item': `${siteConfig.url}/list-your-company`
        }
      ]
    },
    // Service Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'serviceType': 'Business Listing Service',
      'provider': {
        '@type': 'Organization',
        'name': 'CM Directory'
      },
      'areaServed': 'Worldwide',
      'audience': 'Contract Manufacturers',
      'description': 'Free business listing service for contract manufacturers to reach qualified buyers'
    },
    // FAQPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How much does it cost to list my company?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Basic listings are completely free and include your company profile, capabilities, certifications, and contact information. Featured placement options are available for enhanced visibility.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What information do I need to provide?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'You will need your company name, location, primary capabilities (SMT, Through-Hole, Box Build, etc.), certifications (ISO, AS9100, etc.), website URL, and contact information.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How long does verification take?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We manually review new submissions within 1-2 business days. We validate websites and certifications where provided to ensure directory quality.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I update my listing later?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! You can request updates to your profile at any time. Featured partners get priority updates and direct access to profile management.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is Featured Placement?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Featured placement puts your company at the top of search results with a highlighted badge, larger card display, and homepage spotlight. This significantly increases visibility to potential buyers.'
          }
        }
      ]
    }
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  )
}

export default function ListYourCompanyPage() {
  const benefits = [
    {
      icon: '🎯',
      title: 'Reach Qualified Buyers',
      description: 'Get discovered by OEMs, startups, and engineers actively searching for manufacturing partners.'
    },
    {
      icon: '🆓',
      title: 'Free Basic Listing',
      description: 'Create your profile at no cost. Showcase capabilities, certifications, and facility locations.'
    },
    {
      icon: '⚡',
      title: 'Quick Setup',
      description: 'Submit your information and go live within 1-2 business days after verification.'
    },
    {
      icon: '📊',
      title: 'Showcase Capabilities',
      description: 'Highlight your PCB assembly, box build, cable harness, and other manufacturing services.'
    },
    {
      icon: '🏆',
      title: 'Display Certifications',
      description: 'Feature your ISO 13485, AS9100, IPC, and other quality certifications prominently.'
    },
    {
      icon: '🌍',
      title: 'Global Visibility',
      description: 'Be found by buyers searching by location, capability, and industry specialization.'
    }
  ]

  const freeFeatures = [
    'Company profile with logo',
    'Description and capabilities list',
    'Facility locations on map',
    'Certifications display',
    'Industry specializations',
    'Direct contact button',
    'Website link',
    'Unlimited updates'
  ]

  const featuredFeatures = [
    'Everything in Free, plus:',
    'Top placement in search results',
    'Highlighted badge and larger card',
    'Homepage spotlight section',
    'Enhanced profile with images',
    'Priority in filtered results',
    'Analytics dashboard',
    'Priority support and updates'
  ]

  const steps = [
    {
      number: '1',
      title: 'Submit Your Details',
      description: 'Fill out the form with your company information, capabilities, certifications, and contact details.',
      time: '5 minutes'
    },
    {
      number: '2',
      title: 'We Verify',
      description: 'Our team reviews your submission, validates your website and certifications, and ensures quality.',
      time: '1-2 days'
    },
    {
      number: '3',
      title: 'Go Live',
      description: 'Your profile goes live on CM Directory. Start receiving inquiries from qualified buyers.',
      time: 'Immediate'
    }
  ]

  const faqs = [
    {
      q: 'How much does it cost to list my company?',
      a: 'Basic listings are completely free and include your company profile, capabilities, certifications, and contact information. Featured placement options are available for enhanced visibility.'
    },
    {
      q: 'What information do I need to provide?',
      a: 'You will need your company name, location, primary capabilities (SMT, Through-Hole, Box Build, etc.), certifications (ISO, AS9100, etc.), website URL, and contact information.'
    },
    {
      q: 'How long does verification take?',
      a: 'We manually review new submissions within 1-2 business days. We validate websites and certifications where provided to ensure directory quality.'
    },
    {
      q: 'Can I update my listing later?',
      a: 'Yes! You can request updates to your profile at any time. Featured partners get priority updates and direct access to profile management.'
    },
    {
      q: 'What is Featured Placement?',
      a: 'Featured placement puts your company at the top of search results with a highlighted badge, larger card display, and homepage spotlight. This significantly increases visibility to potential buyers.'
    },
    {
      q: 'Will I receive spam or low-quality leads?',
      a: 'CM Directory is targeted at serious buyers including OEMs, startups, and engineering teams. All inquiries come directly through your preferred contact method.'
    }
  ]

  return (
    <>
      {generateJSONLD()}
      <Suspense fallback={<div className="p-4">Loading…</div>}>
      
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        
        {/* Hero Section */}
        <section className="gradient-bg py-20 px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Get Found by Qualified Buyers
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              List your contract manufacturing company for free and connect with OEMs, startups, and engineers searching for reliable partners.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-xl text-slate-600">Go live in 3 simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <Card key={step.number} className="border-slate-200 text-center">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                    <p className="text-slate-600 mb-4">{step.description}</p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                      ⏱️ {step.time}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Submission Form Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl mx-auto">
            <Card className="border-slate-200 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Submit Your Listing</h2>
                  <p className="text-lg text-slate-600">Fill out the form below and we&apos;ll get you live within 1-2 business days</p>
                </div>
                
                {/* Embedded Jotform */}
                <div>
                  <JotformEmbed />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Why List on CM Directory?</h2>
              <p className="text-xl text-slate-600">Join the leading platform connecting manufacturers with qualified buyers</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-slate-600">Everything you need to know about listing your company</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-slate-200">
                  <CardContent className="p-6">
                    <details className="group">
                      <summary className="font-semibold text-lg text-slate-900 cursor-pointer list-none flex items-center justify-between">
                        {faq.q}
                        <span className="transition group-open:rotate-180">
                          ▼
                        </span>
                      </summary>
                      <p className="text-slate-600 mt-4 leading-relaxed">{faq.a}</p>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Found?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join hundreds of manufacturers connecting with qualified buyers every day
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 rounded-xl px-8">
                Submit Free Listing
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-800 rounded-xl px-8">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </div>
      </Suspense>
    </>
  )
}
