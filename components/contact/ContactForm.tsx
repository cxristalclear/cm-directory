"use client"

import JotformEmbed from "@/components/JotformEmbed"

const contactFormUrl = process.env.NEXT_PUBLIC_CONTACT_FORM_URL

export default function ContactForm() {
  if (!contactFormUrl) {
    return (
      <div className="mt-6 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-semibold">Add your Jotform link</p>
        <p className="text-sm text-amber-800">
          Provide a dedicated contact Jotform URL in <code>NEXT_PUBLIC_CONTACT_FORM_URL</code> to embed it here.
          Until then, visitors can reach us at{" "}
          <a className="font-medium text-amber-900 underline" href="mailto:team@pcbafinder.com">
            team@pcbafinder.com
          </a>.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      <JotformEmbed
        formUrl={contactFormUrl}
        minimumHeight={1200}
        title="Contact PCBA Finder"
      />
    </div>
  )
}
