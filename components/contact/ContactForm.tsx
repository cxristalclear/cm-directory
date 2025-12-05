"use client"

import type { FormEvent } from "react"

/**
* Renders a contact form component with name, email, and message fields and validates input on submit.
* @example
* <ContactForm />
* <form aria-label="Contact form">...</form>
* @param {void} props - This component does not accept any props.
* @returns {JSX.Element} A JSX form element for collecting contact requests.
**/
export default function ContactForm() {
  /**
  * Handle the contact form submit: prevent default, extract and validate fields, and trigger submission logic.
  * @example
  * handleContactSubmit(event)
  * undefined
  * @param {FormEvent<HTMLFormElement>} event - Submit event from the contact form.
  * @returns {void} No return value; exits early if validation fails.
  **/
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")?.toString().trim()
    const email = formData.get("email")?.toString().trim()
    const message = formData.get("message")?.toString().trim()

    if (!name || !email || !message) {
      alert("Please fill in all fields")
      return
    }

    // TODO: Implement form submission logic
  }

  return (
    <form className="mt-8 space-y-6" aria-label="Contact form" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
          Work email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="Describe your project, timeline, or questions for the team."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button type="submit" className="btn btn--primary btn--lg shadow-lg">
        Submit request
      </button>
    </form>
  )
}
