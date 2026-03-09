import type { Metadata } from 'next'
import Link from 'next/link'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Pricing | Olde Money Printshop',
  description:
    'View pricing for all print types including standard prints, canvas wraps, metal prints, fine art paper, and acrylic prints.',
}

export default function PricesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Museum-quality prints at competitive prices. Volume discounts
          available.
        </p>
      </div>

      {/* Volume discount banner */}
      <div className="mb-10 rounded-xl border border-green-200 bg-green-50 p-5">
        <h2 className="text-sm font-semibold text-green-800 mb-3">
          Volume Discounts
        </h2>
        <div className="flex flex-wrap gap-3">
          {VOLUME_DISCOUNTS.map((d) => (
            <div
              key={d.minQty}
              className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm border border-green-100"
            >
              <span className="font-medium text-zinc-900">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Media type sections */}
      <div className="space-y-8">
        {MEDIA_TYPES.map((media) => (
          <Card key={media.slug}>
            <CardHeader>
              <CardTitle className="text-xl">{media.name}</CardTitle>
              <p className="text-sm text-zinc-500">{media.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Price table */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                    Size &amp; Base Price
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-zinc-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-zinc-50">
                          <th className="px-4 py-2.5 text-left font-medium text-zinc-600">
                            Size
                          </th>
                          <th className="px-4 py-2.5 text-right font-medium text-zinc-600">
                            Starting at
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {media.priceTiers.map((tier) => (
                          <tr
                            key={tier.label}
                            className="hover:bg-zinc-50 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-medium text-zinc-900">
                              {tier.label}
                            </td>
                            <td className="px-4 py-2.5 text-right text-zinc-700">
                              ${Number(tier.basePrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                    Available Options
                  </h3>
                  <div className="space-y-2">
                    {media.options.map((opt) => (
                      <div
                        key={opt.slug}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2.5"
                      >
                        <span className="text-sm font-medium text-zinc-900">
                          {opt.name}
                        </span>
                        {opt.extraCost > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            +${opt.extraCost.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-zinc-400"
                          >
                            Included
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-zinc-600">
          Ready to order? Upload your images and start customizing.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/image"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Order Now
          </Link>
          <Link
            href="/calculator"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            Try the Calculator
          </Link>
        </div>
      </div>
    </main>
  )
}
