'use client'

import { useState, type FormEvent } from 'react'

const SUBJECT_OPTIONS = [
  'General Question',
  'Order Issue',
  'Custom Quote',
  'Drop Shipping',
] as const

type FormData = {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  honeypot: string
}

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
  honeypot: '',
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Client-side validation
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.subject ||
      !form.message.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
          honeypot: form.honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
      setForm(INITIAL_FORM)
    } catch {
      setError('Unable to send your message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 ring-1 ring-foreground/10">
      <h2 className="text-lg font-semibold text-zinc-900">Send a Message</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Fill out the form below and we&apos;ll get back to you within one
        business day.
      </p>

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Thank you! Your message has been sent. We&apos;ll be in touch soon.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {/* Honeypot field - hidden from real users */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(e) => update('honeypot', e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="first-name"
              className="text-sm font-medium text-zinc-900"
            >
              First name
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder="Jane"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="last-name"
              className="text-sm font-medium text-zinc-900"
            >
              Last name
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              required
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-zinc-900"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-sm font-medium text-zinc-900"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={form.subject}
            onChange={(e) => update('subject', e.target.value)}
            className="flex h-9 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="" disabled>
              Select a subject...
            </option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-medium text-zinc-900"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            placeholder="Tell us how we can help..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
