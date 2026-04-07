import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'

export const metadata: Metadata = {
  title: 'Olde Money Printshop — Transform Your Digital Images into Physical Memories',
  description:
    'Museum-quality photo prints on fine art paper, standard photo paper, and more. Upload, customize, and order with volume discounts.',
}

const FEATURES = [
  {
    kicker: 'Capture',
    title: 'Upload originals without breaking the mood of the image.',
    description:
      'Drag, crop, rotate, and prep each file inside a darker workspace tuned for image-first decisions.',
  },
  {
    kicker: 'Curate',
    title: 'Choose the finish that fits the scene.',
    description:
      'Standard prints for clean everyday framing, fine art paper for deeper tone, texture, and archival presence.',
  },
  {
    kicker: 'Collect',
    title: 'Scale orders with built-in volume pricing.',
    description: `Discounts begin at ${VOLUME_DISCOUNTS.find((d) => d.discountPct > 0)?.minQty ?? 5} prints and climb to ${Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}% off.`,
  },
]

const HERO_STATS = [
  {
    label: 'Starting at',
    value: `$${Math.min(...MEDIA_TYPES.map((media) => media.priceTiers[0]?.basePrice ?? 0)).toFixed(2)}`,
  },
  {
    label: 'Media types',
    value: `${MEDIA_TYPES.length}`,
  },
  {
    label: 'Max volume savings',
    value: `${Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}%`,
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/hp-hero-cardinal.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.54)_42%,rgba(0,0,0,0.2)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(38,187,255,0.22),transparent_30%),linear-gradient(180deg,rgba(18,18,18,0.08)_0%,rgba(18,18,18,0.7)_72%,#121212_100%)]" />
        </div>

        <div className="page-shell relative flex min-h-[calc(100svh-3.5rem)] items-end py-14 sm:py-16 lg:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,24rem)] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow">Olde Money Printshop</p>
              <h1 className="hero-title mt-5 max-w-2xl text-primary-foreground">
                The print studio for images that deserve a theatrical finish.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
                Build premium photo orders against a cinematic dark canvas,
                choose the right surface, and ship museum-quality prints
                without losing the feel of the original image.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/image"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_rgba(0,116,228,0.35)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)]"
                >
                  Start An Order
                </Link>
                <Link
                  href="/prices"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/[0.08]"
                >
                  Explore Pricing
                </Link>
              </div>
            </div>

            <div className="surface-elevated grid gap-4 p-5 sm:p-6">
              <div>
                <p className="eyebrow">Session</p>
                <h2 className="mt-3 text-xl font-semibold text-primary-foreground">
                  Premium materials. Faster visual decisions.
                </h2>
              </div>
              <div className="grid gap-3">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-end justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="text-2xl font-bold text-primary-foreground">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Built for collectors, photographers, and studios ordering
                polished runs instead of one-off throwaways.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2 className="mt-4 max-w-md text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A darker, calmer surface from upload to checkout.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
              The design system shifts the store toward image-first browsing:
              broader spacing, deeper surfaces, brighter CTAs, and fewer visual
              interruptions around the artwork.
            </p>
          </div>
          <div className="grid gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="surface-panel grid gap-3 p-5 sm:grid-cols-[3rem_1fr] sm:items-start sm:p-6"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-[0_10px_24px_rgba(0,116,228,0.3)]">
                  {index + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--free-game-yellow-bright)]">
                    {feature.kicker}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-16 sm:py-20">
        <div className="page-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Formats</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Choose the surface, then build the order around it.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Each media type is treated like a release shelf: one clear offer,
              one visual tone, one pricing path.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {MEDIA_TYPES.map((media) => (
              <div
                key={media.slug}
                className="surface-panel group relative overflow-hidden p-6 sm:p-7"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="inline-flex rounded-full bg-[color:var(--free-game-yellow)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black">
                  {media.slug === 'fine-art-paper' ? 'Collector Grade' : 'Open Edition'}
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {media.name}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      {media.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                      Starting at
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary-foreground">
                      ${media.priceTiers[0].basePrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="text-muted-foreground">
                    {media.options.length} available option{media.options.length === 1 ? '' : 's'}
                  </span>
                  <Link
                    href="/prices"
                    className="font-semibold text-primary transition-colors group-hover:text-[var(--accent-primary-hover)]"
                  >
                    See sizes and pricing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="surface-elevated flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Checkout</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to move from screen light to paper, ink, and frame?
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Volume pricing ranges from {VOLUME_DISCOUNTS.find((d) => d.discountPct > 0)?.discountPct}% to{' '}
              {Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}% off on qualifying runs. Start with a
              single image or price out a full batch first.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/image"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_rgba(0,116,228,0.35)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)]"
            >
              Start Your Order
            </Link>
            <Link
              href="/calculator"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] px-6 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.06]"
            >
              Open Calculator
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
