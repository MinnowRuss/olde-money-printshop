import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileImage,
  Image,
  Ruler,
  Package,
  Truck,
  Palette,
  Zap,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore our full range of printing services including fine art paper, standard photo prints, custom sizing, volume printing, drop shipping, and more.',
}

const SERVICES = [
  {
    icon: FileImage,
    title: 'Fine Art Paper Prints',
    description:
      'Museum-grade gicl\u00e9e prints on 100% cotton rag, bamboo, and alpha-cellulose papers. Perfect for limited editions, portfolio work, and gallery exhibitions.',
  },
  {
    icon: Image,
    title: 'Standard Photo Prints',
    description:
      'Professional-quality prints on lustre, glossy, or metallic photo paper. An excellent choice for everyday photography, events, and client deliverables.',
  },
  {
    icon: Ruler,
    title: 'Custom Sizing',
    description:
      'Need a non-standard dimension? We cut substrates to your exact specifications, from miniature desk prints to large-format wall installations up to 60 inches wide.',
  },
  {
    icon: Package,
    title: 'Volume Printing',
    description:
      'Tiered pricing for bulk orders of 10 or more prints. Ideal for galleries, retailers, corporate offices, and artists producing open or limited edition runs.',
  },
  {
    icon: Truck,
    title: 'Drop Shipping',
    description:
      'We print, package, and ship directly to your customer under your brand. A seamless fulfillment solution for online shops, Etsy sellers, and art marketplaces.',
  },
  {
    icon: Palette,
    title: 'Color Correction',
    description:
      'Our technicians can adjust exposure, white balance, and color cast to optimize your file before printing. Available as an add-on service for any order.',
  },
  {
    icon: Zap,
    title: 'Rush Orders',
    description:
      'Need it fast? Our rush service moves your order to the front of the queue with production in 1\u20132 business days, plus expedited shipping options.',
  },
]

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Our Services
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Everything you need to turn your images into museum-quality prints,
          from a single piece to large-scale production.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div
            key={service.title}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
              <service.icon className="size-5 text-zinc-600" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-zinc-900">
              {service.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            View Pricing
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Browse our media options and get an instant quote with our pricing
            calculator.
          </p>
          <Link
            href="/prices"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            See Prices
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            Have Questions?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Our team is happy to help you choose the right service and substrate
            for your project.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
