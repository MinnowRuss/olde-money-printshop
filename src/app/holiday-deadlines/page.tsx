import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Holiday Ordering Deadlines',
  description:
    'Order by these dates to ensure your prints arrive in time for the holidays. Shipping cutoffs for Valentine\'s Day, Mother\'s Day, Christmas, and more.',
}

const DEADLINES = [
  {
    holiday: "Valentine's Day",
    date: 'February 14',
    standardCutoff: 'February 4',
    rushCutoff: 'February 9',
  },
  {
    holiday: "Mother's Day",
    date: 'May 10',
    standardCutoff: 'April 29',
    rushCutoff: 'May 5',
  },
  {
    holiday: "Father's Day",
    date: 'June 21',
    standardCutoff: 'June 10',
    rushCutoff: 'June 16',
  },
  {
    holiday: 'Graduation Season',
    date: 'May - June',
    standardCutoff: '3 weeks before ceremony',
    rushCutoff: '10 days before ceremony',
  },
  {
    holiday: 'Halloween',
    date: 'October 31',
    standardCutoff: 'October 20',
    rushCutoff: 'October 26',
  },
  {
    holiday: 'Thanksgiving',
    date: 'November 26',
    standardCutoff: 'November 13',
    rushCutoff: 'November 20',
  },
  {
    holiday: 'Hanukkah',
    date: 'December 14 - 22',
    standardCutoff: 'December 1',
    rushCutoff: 'December 8',
  },
  {
    holiday: 'Christmas',
    date: 'December 25',
    standardCutoff: 'December 5',
    rushCutoff: 'December 15',
  },
  {
    holiday: "New Year's",
    date: 'January 1, 2027',
    standardCutoff: 'December 17',
    rushCutoff: 'December 24',
  },
]

export default function HolidayDeadlinesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          2026 Holiday Ordering Deadlines
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Order by these dates to make sure your prints arrive in time for every
          occasion. Deadlines are based on standard U.S. shipping.
        </p>
      </div>

      <div className="space-y-10">
        {/* Shipping speed explanation */}
        <section>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              How Deadlines Work
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Each deadline below is the last day you can place your order and
            reasonably expect delivery before the holiday. Standard deadlines
            assume our standard 5-7 business day production time plus standard
            shipping. Rush deadlines assume 2-3 business day production plus
            expedited shipping.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Standard
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                5-7 business days production + standard shipping (2-5 days).
                Plan for up to 12 business days total.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h3 className="text-sm font-semibold text-foreground">Rush</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                2-3 business days production + expedited shipping (1-2 days).
                Additional fees apply for both rush production and expedited
                shipping.
              </p>
            </div>
          </div>
        </section>

        {/* Deadline table */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2026 Cutoff Dates
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left font-semibold text-foreground">
                    Holiday
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-foreground">
                    Standard Order By
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-foreground">
                    Rush Order By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {DEADLINES.map((row) => (
                  <tr key={row.holiday}>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {row.holiday}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.date}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {row.standardCutoff}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {row.rushCutoff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Custom / large orders note */}
        <section className="flex gap-4 rounded-xl border border-border bg-muted/40 p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Custom &amp; Large Orders
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Orders that include custom framing, canvas stretching, metal
              prints larger than 24x36, or quantities of 10 or more may require
              additional production time. For these orders, we recommend placing
              your order at least one week before the standard cutoff dates
              listed above. If you are unsure about lead times for a specific
              project, please{' '}
              <Link
                href="/contact"
                className="text-foreground underline transition-colors hover:text-muted-foreground"
              >
                contact us
              </Link>{' '}
              and we will provide a custom timeline.
            </p>
          </div>
        </section>

        {/* Peak season note */}
        <section className="rounded-xl border border-border bg-muted/40 p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Peak Season Notice
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            The period from mid-November through late December is our busiest
            time of year. Production and shipping times may run slightly longer
            than usual during this window. We strongly recommend ordering as
            early as possible for any holiday between Thanksgiving and New
            Year&apos;s to avoid delays.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-muted/40 p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Don&apos;t Wait Until the Last Minute
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The earlier you order, the more time we have to make your prints
            perfect. Start your order today and check one more gift off your
            list.
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
