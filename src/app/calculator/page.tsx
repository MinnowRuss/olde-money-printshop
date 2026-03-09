import type { Metadata } from 'next'
import PricingCalculator from '@/components/PricingCalculator'

export const metadata: Metadata = {
  title: 'Price Calculator | Olde Money Printshop',
  description:
    'Calculate the cost of your custom prints instantly. Select media type, dimensions, options, and quantity to see live pricing.',
}

export default function CalculatorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Price Calculator
        </h1>
        <p className="mt-2 text-zinc-600">
          Configure your print options below to see live pricing. Volume
          discounts are applied automatically.
        </p>
      </div>

      <PricingCalculator />
    </main>
  )
}
