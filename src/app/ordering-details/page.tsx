import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ImageUp,
  MousePointerClick,
  CreditCard,
  Truck,
  FileImage,
  Clock,
  PackageCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ordering Details | Olde Money Printshop',
  description:
    'Learn how to place an order with Olde Money Printshop. File requirements, turnaround times, shipping options, and step-by-step instructions.',
}

const STEPS = [
  {
    icon: ImageUp,
    title: 'Upload Your Image',
    description:
      'Sign in to your account and upload your high-resolution image through our secure portal. We accept JPEG, TIFF, and PNG formats.',
  },
  {
    icon: MousePointerClick,
    title: 'Choose Your Options',
    description:
      'Select your print size, medium (lustre, glossy, matte, canvas, metal), and any finishing options such as mounting or framing.',
  },
  {
    icon: CreditCard,
    title: 'Review & Pay',
    description:
      'Review your order summary, enter your shipping address, and complete checkout with a credit card, debit card, or Apple Pay.',
  },
  {
    icon: PackageCheck,
    title: 'We Print & Ship',
    description:
      'Our team prints, inspects, and carefully packages your order. You will receive a tracking number as soon as it ships.',
  },
]

const FILE_REQUIREMENTS = [
  { label: 'Accepted Formats', value: 'JPEG, TIFF, PNG' },
  { label: 'Recommended Resolution', value: '300 DPI at final print size' },
  { label: 'Minimum Resolution', value: '150 DPI at final print size' },
  { label: 'Color Space', value: 'sRGB (recommended) or Adobe RGB' },
  { label: 'Maximum File Size', value: '50 MB per image' },
]

const TURNAROUND = [
  {
    tier: 'Standard',
    time: '5 - 7 business days',
    description:
      'Our default production speed. Most orders ship within 5 business days.',
  },
  {
    tier: 'Rush',
    time: '2 - 3 business days',
    description:
      'Need it faster? Rush processing is available for an additional fee at checkout.',
  },
]

const SHIPPING_OPTIONS = [
  {
    carrier: 'USPS Priority Mail',
    estimate: '2 - 5 business days after production',
  },
  {
    carrier: 'UPS Ground',
    estimate: '3 - 7 business days after production',
  },
  {
    carrier: 'UPS 2-Day',
    estimate: '2 business days after production',
  },
  {
    carrier: 'UPS Next Day Air',
    estimate: '1 business day after production',
  },
]

export default function OrderingDetailsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How to Order
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ordering custom prints is simple. Follow the steps below to go from
          image file to finished print on your wall.
        </p>
      </div>

      <div className="space-y-12">
        {/* Step-by-step */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Step-by-Step Process
          </h2>
          <div className="mt-4 space-y-4">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-xl border border-border bg-muted/40 p-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <step.icon className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* File requirements */}
        <section>
          <div className="flex items-center gap-2">
            <FileImage className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              File Requirements
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Submitting a properly prepared file ensures the best print quality.
            Please review the requirements below before uploading.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-5">
            <dl className="space-y-3">
              {FILE_REQUIREMENTS.map((req) => (
                <div key={req.label} className="flex flex-col sm:flex-row sm:gap-2">
                  <dt className="text-sm font-medium text-foreground sm:w-48 sm:shrink-0">
                    {req.label}
                  </dt>
                  <dd className="text-sm text-muted-foreground">{req.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Need help preparing your files?{' '}
            <Link
              href="/file-setup"
              className="text-foreground underline transition-colors hover:text-muted-foreground"
            >
              View our file setup guide
            </Link>
            .
          </p>
        </section>

        {/* Turnaround times */}
        <section>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              Turnaround Times
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Turnaround time is measured from when your order is confirmed and
            payment is received. It does not include shipping transit time.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {TURNAROUND.map((option) => (
              <div
                key={option.tier}
                className="rounded-xl border border-border bg-muted/40 p-5"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {option.tier}
                </h3>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {option.time}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping */}
        <section>
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              Shipping Information
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            All orders ship with tracking. You will receive a confirmation email
            with your tracking number once your order leaves our facility.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold text-foreground">
                    Carrier
                  </th>
                  <th className="pb-2 text-left font-semibold text-foreground">
                    Estimated Transit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {SHIPPING_OPTIONS.map((option) => (
                  <tr key={option.carrier}>
                    <td className="py-2 text-muted-foreground">{option.carrier}</td>
                    <td className="py-2 text-muted-foreground">{option.estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Shipping rates are calculated at checkout based on order size,
            weight, and destination. We currently ship to all 50 U.S. states.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-muted/40 p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Ready to Order?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Upload your images and start building your order today. Our team is
            standing by to bring your photos and artwork to life.
          </p>
          <Link
            href="/image"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            Start Your Order
          </Link>
        </section>
      </div>
    </main>
  )
}
