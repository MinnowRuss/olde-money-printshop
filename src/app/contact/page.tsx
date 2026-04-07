import type { Metadata } from 'next'
import { Mail, Phone, MapPin } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Olde Money',
  description:
    'Get in touch with Olde Money Printing. We are happy to answer questions about custom prints, orders, and turnaround times.',
}

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'gallery@oldemoney.com',
    href: 'mailto:gallery@oldemoney.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '(603) 320-8432',
    href: 'tel:+16033208432',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'South Berwick, Maine, USA',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Have a question about your order or our print options? We&apos;d love to
          hear from you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Whether you need help choosing the right print medium, have a
            question about an existing order, or want to discuss a custom
            project, our team is here to help.
          </p>

          <dl className="mt-8 space-y-6">
            {CONTACT_DETAILS.map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <item.icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <dt className="text-sm font-medium text-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-muted-foreground">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-colors hover:text-foreground"
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

          <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Business Hours
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Monday – Friday</span>
                <span className="font-medium text-foreground">
                  9:00 AM – 6:00 PM
                </span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium text-foreground">
                  10:00 AM – 4:00 PM
                </span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-foreground">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact form */}
        <ContactForm />
      </div>
    </main>
  )
}
