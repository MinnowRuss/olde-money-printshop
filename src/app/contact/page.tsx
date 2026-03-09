import type { Metadata } from 'next'
import { Mail, Phone, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact | Olde Money Printshop',
  description:
    'Get in touch with Olde Money Printshop. We are happy to answer questions about custom prints, orders, and turnaround times.',
}

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@oldemoneyprintshop.com',
    href: 'mailto:hello@oldemoneyprintshop.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '(555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Print Lane, Studio City, CA 91604',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Have a question about your order or our print options? We&apos;d love to
          hear from you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Whether you need help choosing the right print medium, have a
            question about an existing order, or want to discuss a custom
            project, our team is here to help.
          </p>

          <dl className="mt-8 space-y-6">
            {CONTACT_DETAILS.map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <item.icon className="size-5 text-zinc-600" />
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-900">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-zinc-600">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-colors hover:text-zinc-900"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Business Hours
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              <li className="flex justify-between">
                <span>Monday – Friday</span>
                <span className="font-medium text-zinc-900">
                  9:00 AM – 6:00 PM
                </span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium text-zinc-900">
                  10:00 AM – 4:00 PM
                </span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-zinc-900">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold text-zinc-900">
            Send a Message
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Fill out the form below and we&apos;ll get back to you within one
            business day.
          </p>

          <form className="mt-6 space-y-5">
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
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="Question about my order"
              />
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
                className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="Tell us how we can help…"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
