import { Suspense } from "react"
import { Metadata } from "next"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config"

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
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 rounded-xl px-8">
                Submit Free Listing
              </Button>
              <Button size="lg" variant="outline" className="bg-blue-800 text-white hover:bg-blue-600 rounded-xl px-8">
                Learn About Featured
              </Button>
            </div>
            <p className="mt-6 text-blue-100 text-sm">
              ✓ Free forever · ✓ No credit card required · ✓ Live in 1-2 days
            </p>
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

        {/* Free vs Featured Comparison */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
              <p className="text-xl text-slate-600">Start free, upgrade anytime for maximum visibility</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="border-slate-200 relative">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Free Listing</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">$0<span className="text-lg text-slate-600 font-normal">/forever</span></div>
                    <p className="text-slate-600">Perfect for getting started</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-slate-700">
                        <span className="text-green-600 mr-3 text-xl flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-xl" size="lg">
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Featured Plan */}
              <Card className="border-blue-300 border-2 relative shadow-xl">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  POPULAR
                </div>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Featured Placement</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">Custom<span className="text-lg text-slate-600 font-normal">/pricing</span></div>
                    <p className="text-slate-600">Maximum visibility to buyers</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {featuredFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-slate-700">
                        <span className="text-blue-600 mr-3 text-xl flex-shrink-0">✓</span>
                        <span className={index === 0 ? 'font-semibold' : ''}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700" size="lg">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
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
                
                {/* Form Placeholder */}
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name *</label>
                      <input 
                        type="text" 
                        placeholder="Acme Manufacturing Inc."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Website URL *</label>
                      <input 
                        type="url" 
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Location (City) *</label>
                      <input 
                        type="text" 
                        placeholder="San Jose"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State / Country *</label>
                      <input 
                        type="text" 
                        placeholder="California, USA"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Capabilities * (Select all that apply)</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {['PCB Assembly (SMT)', 'PCB Assembly (Through-Hole)', 'Cable Harness Assembly', 'Box Build Assembly', 'Prototyping', 'Design Services'].map((cap) => (
                        <label key={cap} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-slate-700">{cap}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Certifications (Select all that apply)</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {['ISO 9001', 'ISO 13485', 'AS9100', 'IPC-A-610', 'ITAR', 'RoHS'].map((cert) => (
                        <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-slate-700">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Description *</label>
                    <textarea 
                      rows={4}
                      placeholder="Brief description of your company, services, and what makes you unique..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Email *</label>
                      <input 
                        type="email" 
                        placeholder="sales@example.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded mt-1" />
                    <label className="text-sm text-slate-600">
                      I agree to the terms of service and confirm that the information provided is accurate.
                    </label>
                  </div>

                  <Button size="lg" className="w-full rounded-xl text-lg py-6">
                    Submit Free Listing
                  </Button>

                  <p className="text-center text-sm text-slate-500">
                    By submitting, you agree to our verification process. We&apos;ll contact you within 1-2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
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