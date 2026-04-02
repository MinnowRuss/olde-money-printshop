import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Paintbrush,
  Shield,
  Palette,
  HeartHandshake,
  Upload,
  SlidersHorizontal,
  Printer,
  Truck,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Olde Money Printing — founded by artists and photographers with a passion for archival-quality printing and exceptional craftsmanship.',
}

const VALUES = [
  {
    icon: Paintbrush,
    title: 'Craftsmanship',
    description:
      'Every print is produced with meticulous attention to detail. We treat each image as a work of art, carefully calibrating color profiles and selecting the ideal substrate for your vision.',
  },
  {
    icon: Shield,
    title: 'Archival Quality',
    description:
      'We use only museum-grade, archival inks and substrates rated to last 75 to 200+ years. Your prints are built to endure for generations.',
  },
  {
    icon: Palette,
    title: 'Color Accuracy',
    description:
      'Our wide-gamut printers and ICC-profiled workflow ensure that the colors you see on screen are faithfully reproduced on paper, canvas, and beyond.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer Service',
    description:
      'From file preparation guidance to post-delivery support, our team is here to help at every step. Your satisfaction is our highest priority.',
  },
]

const PROCESS_STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload',
    description:
      'Upload your high-resolution image through our secure platform. We accept JPEG, PNG, TIFF, and PSD files.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Customize',
    description:
      'Choose your print medium, size, and finish. Our calculator gives you an instant quote so there are no surprises.',
  },
  {
    icon: Printer,
    step: '03',
    title: 'Print',
    description:
      'Our technicians review your file, optimize it for print, and produce your order on professional-grade equipment.',
  },
  {
    icon: Truck,
    step: '04',
    title: 'Deliver',
    description:
      'Your print is carefully packaged in protective materials and shipped to your door, ready to hang or frame.',
  },
]

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          About Olde Money Printshop
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Where art meets archival craftsmanship.
        </p>
      </div>

      {/* Our Story */}
      <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">Our Story</h2>
          <p className="mt-3">
            Olde Money Printing was founded by an artist and
            photographer who shared a common frustration: finding a print lab that
            treated their work with the same care they put into creating it. Too many
            services delivered washed-out colors, flimsy substrates, and generic
            results. We knew there had to be a better way.
          </p>
          <p className="mt-3">
            In 2024, we opened our doors with a simple mission — to make
            museum-quality printing accessible to everyone, from independent artists
            selling their first edition to commercial studios producing gallery shows.
            Every print that leaves our shop is one we would be proud to hang on our
            own walls.
          </p>
          <p className="mt-3">
            Today, we serve photographers, fine artists, interior designers, and
            businesses across the country. Our state-of-the-art facility houses
            wide-format printers capable of reproducing the full spectrum of color with
            breathtaking precision, paired with an inventory of premium substrates
            ranging from cotton rag paper to gallery-wrap canvas and brushed aluminum.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">What We Stand For</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                  <value.icon className="size-5 text-zinc-600" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900">How It Works</h2>
          <p className="mt-3">
            Getting a museum-quality print is straightforward. Here is our four-step
            process from file to finished piece.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                  <step.icon className="size-5 text-zinc-600" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Step {step.step}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            Ready to Bring Your Images to Life?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Upload your first image and experience the difference that archival-quality
            printing makes.
          </p>
          <Link
            href="/prices"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Start Your Order
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}
