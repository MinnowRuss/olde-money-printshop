import type { Metadata } from 'next'
import Link from 'next/link'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Pricing | Olde Money Printshop',
  description:
    'View pricing for all print types including standard prints and fine art paper prints.',
}

export default function PricesPage() {
  return (
    <main className="page-shell py-10 sm:py-14">
      <section className="surface-elevated overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Pricing Deck</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Clear print pricing, cinematic presentation.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Rates stay legible and fast to compare: base sizes on the left,
              add-ons on the right, and discount tiers surfaced like release
              promos instead of footnotes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Entry price
              </p>
              <p className="mt-2 text-3xl font-bold text-primary-foreground">
                ${Math.min(...MEDIA_TYPES.map((media) => media.priceTiers[0]?.basePrice ?? 0)).toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Top savings
              </p>
              <p className="mt-2 text-3xl font-bold text-[color:var(--sale-green)]">
                {Math.max(...VOLUME_DISCOUNTS.map((d) => d.discountPct))}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--free-game-yellow-bright)]">
            Volume Discounts
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {VOLUME_DISCOUNTS.map((discount) => (
              <div
                key={discount.label}
                className="rounded-full border border-[color:var(--sale-green)]/30 bg-[color:var(--sale-green)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--sale-green)]"
              >
                {discount.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-8">
        {MEDIA_TYPES.map((media) => (
          <Card key={media.slug} className="overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--free-game-yellow-bright)]">
                    {media.slug === 'fine-art-paper' ? 'Collector Grade' : 'Open Edition'}
                  </p>
                  <CardTitle className="mt-2 text-2xl sm:text-3xl">
                    {media.name}
                  </CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {media.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Starts at
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary-foreground">
                    ${Number(media.priceTiers[0]?.basePrice ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Size And Base Price
                  </h2>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03]">
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                            Size
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                            Starting at
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {media.priceTiers.map((tier) => (
                          <tr
                            key={tier.label}
                            className="transition-colors hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">
                              {tier.label}
                            </td>
                            <td className="px-4 py-3 text-right text-primary-foreground">
                              ${Number(tier.basePrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Available Options
                  </h2>
                  <div className="grid gap-3">
                    {media.options.map((option) => (
                      <div
                        key={option.slug}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {option.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                            Add-on
                          </p>
                        </div>
                        {option.extraCost > 0 ? (
                          <Badge variant="secondary">
                            +${option.extraCost.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Included</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Next Step</p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Upload images to build an order or open the calculator for a faster
            custom quote.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/image"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_rgba(0,116,228,0.35)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)]"
          >
            Order Now
          </Link>
          <Link
            href="/calculator"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.06]"
          >
            Try The Calculator
          </Link>
        </div>
      </section>
    </main>
  )
}
