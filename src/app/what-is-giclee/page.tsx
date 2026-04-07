import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Droplets,
  Clock,
  Palette,
  Image,
  Camera,
  Frame,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'What Is Gicl\u00e9e Printing?',
  description:
    'Learn about gicl\u00e9e printing — the museum-quality inkjet process used by galleries and artists for fine art reproduction, photography, and limited editions.',
}

const DIFFERENCES = [
  {
    feature: 'Ink Technology',
    standard: 'Dye-based inks that fade within 5\u201325 years',
    giclee: 'Archival pigment inks rated for 75\u2013200+ years',
  },
  {
    feature: 'Color Gamut',
    standard: '4\u20136 ink channels with limited color range',
    giclee: '8\u201312 ink channels for a vastly wider gamut',
  },
  {
    feature: 'Resolution',
    standard: 'Typically 300\u2013720 DPI',
    giclee: 'Up to 2400 DPI for razor-sharp detail',
  },
  {
    feature: 'Substrates',
    standard: 'Standard photo paper or cardstock',
    giclee: 'Fine art cotton rag, canvas, metallic, and specialty papers',
  },
  {
    feature: 'Color Accuracy',
    standard: 'Generic color profiles',
    giclee: 'Custom ICC profiles calibrated per substrate',
  },
  {
    feature: 'Best For',
    standard: 'Everyday photos, flyers, and signage',
    giclee: 'Fine art, gallery work, photography, and limited editions',
  },
]

const USE_CASES = [
  {
    icon: Image,
    title: 'Fine Art Reproduction',
    description:
      'Artists use gicl\u00e9e to produce faithful reproductions of original paintings, illustrations, and mixed-media work for sale and exhibition.',
  },
  {
    icon: Camera,
    title: 'Professional Photography',
    description:
      'Photographers rely on gicl\u00e9e for portfolio prints, gallery shows, and client deliverables that demand accurate color and lasting quality.',
  },
  {
    icon: Frame,
    title: 'Limited Editions',
    description:
      'Numbered and signed limited-edition prints maintain consistent quality across every copy in the run, making gicl\u00e9e the industry standard.',
  },
  {
    icon: Palette,
    title: 'Interior Design & D\u00e9cor',
    description:
      'Designers specify gicl\u00e9e prints for residential and commercial projects because of their rich color, elegant texture, and longevity.',
  },
]

export default function WhatIsGicleePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What Is Gicl&eacute;e Printing?
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          The gold standard for museum-quality fine art and photographic prints.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        {/* Definition */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            The Basics
          </h2>
          <p className="mt-3">
            The word <em>gicl&eacute;e</em> (pronounced &ldquo;zhee-CLAY&rdquo;) comes
            from the French verb <em>gicler</em>, meaning &ldquo;to spray.&rdquo; It
            refers to a high-end inkjet printing process that uses archival pigment
            inks and fine art substrates to produce prints with exceptional color
            accuracy, tonal range, and longevity.
          </p>
          <p className="mt-3">
            Originally adopted by printmakers and galleries in the early 1990s, gicl&eacute;e
            printing has become the preferred method for reproducing fine art,
            photography, and illustration at the highest quality. Museums, galleries,
            and collectors around the world trust gicl&eacute;e prints because they
            faithfully capture the nuance of the original work.
          </p>
        </section>

        {/* How it differs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Gicl&eacute;e vs. Standard Printing
          </h2>
          <p className="mt-3">
            Not all inkjet prints are created equal. Here is how gicl&eacute;e
            compares to standard digital printing.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 font-semibold text-foreground">Feature</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">Standard Print</th>
                  <th className="pb-3 font-semibold text-foreground">Gicl&eacute;e Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {DIFFERENCES.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.standard}</td>
                    <td className="py-3 text-muted-foreground">{row.giclee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Longevity */}
        <section>
          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <Clock className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Built to Last: 75&ndash;200+ Years
                </h2>
                <p className="mt-2">
                  The archival pigment inks used in gicl&eacute;e printing are
                  engineered for permanence. Independent testing by the Wilhelm
                  Imaging Research Institute rates these inks at 75 to over 200 years
                  of display life, depending on the substrate and display conditions.
                  That means your gicl&eacute;e print can be passed down through
                  generations without significant fading or color shift.
                </p>
                <p className="mt-2">
                  For comparison, standard dye-based inkjet prints typically begin to
                  fade noticeably within 5 to 25 years, especially in direct or
                  indirect sunlight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inks & substrates */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Archival Inks &amp; Premium Substrates
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                <Droplets className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Pigment-Based Inks
              </h3>
              <p className="mt-1.5">
                Unlike dye inks that dissolve into the substrate, pigment inks sit on
                the surface as microscopic particles. This gives them superior fade
                resistance, water resistance, and a broader color gamut that captures
                subtle tonal transitions.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                <Palette className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Specialty Substrates
              </h3>
              <p className="mt-1.5">
                Gicl&eacute;e prints can be produced on a wide range of substrates
                including 100% cotton rag paper, museum-grade canvas, metallic photo
                paper, bamboo fiber, and more. Each substrate brings its own texture,
                feel, and visual character to the finished print.
              </p>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Best Use Cases
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {USE_CASES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-muted/40 p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                  <item.icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-muted/40 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Experience Gicl&eacute;e Quality for Yourself
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Browse our full range of print media and get an instant quote for your
            next project.
          </p>
          <Link
            href="/prices"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            Explore Media &amp; Pricing
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}
