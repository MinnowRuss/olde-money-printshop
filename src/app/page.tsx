import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'

export const metadata: Metadata = {
  title: 'Olde Money Printshop — Transform Your Digital Images into Physical Memories',
  description:
    'Museum-quality photo prints on fine art paper, standard photo paper, and more. Upload, customize, and order with volume discounts.',
}

const MEDIA_ICONS: Record<string, string> = {
  'standard-print': 'Photo Paper',
  'fine-art-paper': 'Fine Art',
}

const FEATURES = [
  {
    title: 'Upload & Edit',
    description: 'Drag-and-drop your photos, crop and adjust before printing.',
  },
  {
    title: 'Choose Your Medium',
    description: 'Standard prints or fine art paper — pick the perfect medium.',
  },
  {
    title: 'Volume Discounts',
    description: `Save up to ${Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}% with volume discounts starting at ${VOLUME_DISCOUNTS.find((d) => d.discountPct > 0)?.minQty ?? 5} prints.`,
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950">
        {/* Hero background image at 90% opacity */}
        <div className="absolute inset-0">
          <Image
            src="/hp-hero-cardinal.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
          {/* Dark overlay to ensure text legibility */}
          <div className="absolute inset-0 bg-zinc-950/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">
              Museum-quality printing
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Transform your digital images into physical memories.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              From fine art paper to premium photo prints, we bring your
              photos to life with archival-quality materials that last
              generations.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/image"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Start Your Order
              </Link>
              <Link
                href="/prices"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 px-6 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-zinc-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 text-zinc-600">
              Three simple steps from screen to print.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-900">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Types */}
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Print Media
            </h2>
            <p className="mt-3 text-zinc-600">
              Choose the perfect medium for your artwork.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEDIA_TYPES.map((media) => (
              <div
                key={media.slug}
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 inline-flex rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  {MEDIA_ICONS[media.slug] ?? media.name}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {media.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {media.description}
                </p>
                <p className="mt-4 text-sm text-zinc-900">
                  Starting at{' '}
                  <span className="font-semibold">
                    ${media.priceTiers[0].basePrice.toFixed(2)}
                  </span>
                </p>
                <Link
                  href="/prices"
                  className="mt-4 inline-flex text-sm font-medium text-zinc-600 transition-colors group-hover:text-zinc-900"
                >
                  See sizes &amp; pricing &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-zinc-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Ready to print?
          </h2>
          <p className="mt-3 text-zinc-600">
            Upload your photos, pick your medium, and let us handle the rest.
            Volume discounts from {VOLUME_DISCOUNTS.find((d) => d.discountPct > 0)?.discountPct}% to {Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}% on orders of {VOLUME_DISCOUNTS.find((d) => d.discountPct > 0)?.minQty}+ prints.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/image"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Get Started
            </Link>
            <Link
              href="/calculator"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              Try the Price Calculator
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
