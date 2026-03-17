import type { Metadata } from 'next'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Testimonials | Olde Money Printing',
  description:
    'See what photographers, artists, designers, and businesses are saying about Olde Money Printing.',
}

const TESTIMONIALS = [
  {
    quote:
      'The color accuracy on my landscape prints is unreal. I have printed with half a dozen labs over the years and Olde Money is the first one where the print matches what I see on my calibrated monitor. I will never go anywhere else.',
    name: 'Marcus Chen',
    role: 'Landscape Photographer',
    rating: 5,
  },
  {
    quote:
      'I sell limited-edition gicl\u00e9e prints of my oil paintings and the reproduction quality is so faithful that collectors sometimes ask if they are looking at the original. The cotton rag paper has a beautiful hand-feel too.',
    name: 'Isabelle Durand',
    role: 'Fine Artist',
    rating: 5,
  },
  {
    quote:
      'We specify Olde Money for all of our residential and hospitality projects. The turnaround is reliable, the packaging is excellent, and the prints arrive ready to frame. It makes our job so much easier.',
    name: 'Priya Nair',
    role: 'Interior Designer, Atelier Nair',
    rating: 5,
  },
  {
    quote:
      'My husband and I ordered a 40\u00d760 print of our favorite wedding photo and we are still in awe every time we walk past it. The detail and color are stunning. Worth every penny.',
    name: 'Jessica & Daniel Park',
    role: 'Wedding Clients',
    rating: 5,
  },
  {
    quote:
      'We needed 200 prints for our new office lobby and conference rooms on a tight deadline. The team delivered on time, on budget, and the quality blew our facilities manager away. Highly recommend for corporate projects.',
    name: 'Tom Richards',
    role: 'Creative Director, Apex Media Group',
    rating: 5,
  },
  {
    quote:
      'I was nervous about printing my digital illustrations for the first time, but the team walked me through file prep, paper selection, and even sent me a proof. The final prints are gallery-ready and I could not be happier.',
    name: 'Anika Johansson',
    role: 'Digital Illustrator',
    rating: 5,
  },
  {
    quote:
      'As a real estate photographer, I need fast turnaround and consistent quality for agent presentations. Olde Money delivers both. Their rush order option has saved me more than once.',
    name: 'David Morales',
    role: 'Real Estate Photographer',
    rating: 4,
  },
  {
    quote:
      'I run a small Etsy shop selling botanical prints and I use Olde Money for all of my fulfillment. Their drop-shipping service is seamless \u2014 my customers get a beautifully packaged print and I never have to touch inventory.',
    name: 'Sarah Linden',
    role: 'Etsy Shop Owner, Bloom & Ink',
    rating: 5,
  },
  {
    quote:
      'The fine art print we ordered for our living room has this incredible depth and luminosity. Friends always comment on it. The whole ordering process was smooth from upload to delivery.',
    name: 'James & Emily Whitfield',
    role: 'Homeowners',
    rating: 5,
  },
  {
    quote:
      'I teach printmaking at a university and I recommend Olde Money to every graduating student who needs portfolio-quality prints. The gicl\u00e9e work is exceptional and their customer service is genuinely helpful.',
    name: 'Prof. Lawrence Kim',
    role: 'Art Department, Pacific Northwest University',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-zinc-200 text-zinc-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          What Our Customers Say
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Real feedback from photographers, artists, designers, and businesses
          who trust us with their work.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <div>
              <StarRating rating={testimonial.rating} />
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </div>
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <p className="text-sm font-semibold text-zinc-900">
                {testimonial.name}
              </p>
              <p className="text-xs text-zinc-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-zinc-900">
          Ready to See the Difference?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Join thousands of satisfied customers and experience museum-quality
          printing for yourself.
        </p>
        <Link
          href="/prices"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Start Your Order
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  )
}
