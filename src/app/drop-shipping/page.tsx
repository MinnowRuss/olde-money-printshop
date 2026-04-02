import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Package,
  Upload,
  Truck,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Drop Shipping',
  description:
    'Print and ship directly to your customers with Olde Money Printshop drop shipping. No inventory, white-label packaging, and volume discounts.',
}

const STEPS = [
  {
    icon: Upload,
    title: 'Upload Your Images',
    description:
      'Send us your high-resolution files through our secure portal. We accept JPEG, TIFF, and PNG formats up to 50 MB per image.',
  },
  {
    icon: Package,
    title: 'Set Up Your Orders',
    description:
      'Choose your print sizes, mediums, and finishes. Provide your customer shipping addresses and any special instructions.',
  },
  {
    icon: Truck,
    title: 'We Ship to Your Customers',
    description:
      'We print, package, and ship each order directly to your customer with white-label packaging. No mention of Olde Money Printshop anywhere.',
  },
]

const AUDIENCES = [
  {
    icon: Users,
    label: 'Photographers',
    description:
      'Sell prints of your work without managing inventory or shipping logistics.',
  },
  {
    icon: TrendingUp,
    label: 'E-Commerce Sellers',
    description:
      'Add high-quality art and photo prints to your online store with zero upfront cost.',
  },
  {
    icon: ShieldCheck,
    label: 'Artists & Illustrators',
    description:
      'Turn your digital artwork into museum-quality prints and ship worldwide.',
  },
  {
    icon: Package,
    label: 'Galleries & Dealers',
    description:
      'Fulfill collector orders on demand without warehousing framed or unframed prints.',
  },
]

const BENEFITS = [
  {
    title: 'No Inventory Risk',
    description:
      'We print on demand, so you never have to purchase, store, or manage unsold stock.',
  },
  {
    title: 'White-Label Packaging',
    description:
      'Every shipment goes out in plain, unbranded packaging or with your custom branding if you prefer.',
  },
  {
    title: 'Volume Discounts',
    description:
      'The more you ship, the more you save. Tiered pricing starts at just 10 orders per month.',
  },
  {
    title: 'Fast Turnaround',
    description:
      'Standard orders ship within 5-7 business days. Rush processing available for 2-3 day turnaround.',
  },
  {
    title: 'Quality Guarantee',
    description:
      'Every print is inspected before shipping. If a print does not meet our standards, we reprint it at no charge.',
  },
  {
    title: 'Real-Time Tracking',
    description:
      'Receive tracking numbers for every shipment so you can keep your customers informed.',
  },
]

export default function DropShippingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Drop Shipping Program
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
          We print and ship directly to your customers so you can focus on
          growing your business. No inventory, no hassle.
        </p>
      </div>

      <div className="space-y-12">
        {/* What is drop shipping */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">
            What Is Drop Shipping?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Drop shipping with Olde Money Printshop means you sell prints under
            your own brand while we handle the production and fulfillment. When
            your customer places an order, you submit it to us and we take care
            of the rest — printing on premium materials, quality-checking every
            piece, packaging it securely, and shipping it straight to your
            customer&apos;s door. Your customers never know a third party was
            involved.
          </p>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">
            Who It&apos;s For
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.label}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex items-center gap-3">
                  <audience.icon className="size-5 text-zinc-600" />
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {audience.label}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">
            How It Works
          </h2>
          <div className="mt-4 space-y-4">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <step.icon className="size-4 text-zinc-500" />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">Benefits</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <h3 className="text-sm font-semibold text-zinc-900">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            Ready to Get Started?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Contact us to set up your drop shipping account. We&apos;ll walk you
            through pricing, onboarding, and everything you need to start
            selling prints under your own brand.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </main>
  )
}
