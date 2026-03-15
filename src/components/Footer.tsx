import Link from 'next/link'
import FooterSignup from '@/components/FooterSignup'

const SHOP_LINKS = [
  { href: '/prices', label: 'Prices' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/services', label: 'Services' },
  { href: '/drop-shipping', label: 'Drop Shipping' },
]

const LEARN_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/what-is-giclee', label: 'What is Giclée?' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/ordering-details', label: 'How to Order' },
  { href: '/file-setup', label: 'File Setup Guide' },
  { href: '/holiday-deadlines', label: 'Holiday Deadlines' },
]

const SUPPORT_LINKS = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/olde.money', label: 'Instagram' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Multi-column link grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Olde Money Printshop
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Museum-quality photo prints on canvas, metal, acrylic, fine art
              paper, and more.
            </p>
            <div className="mt-4">
              <p className="text-xs font-semibold text-zinc-900">Stay Updated</p>
              <p className="mt-1 text-xs text-zinc-500">Get promotions and print tips</p>
              <div className="relative mt-2">
                <FooterSignup />
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-zinc-500">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-900"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Shop
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-zinc-500">
              {SHOP_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-zinc-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Learn column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Learn
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-zinc-500">
              {LEARN_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-zinc-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Support
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-zinc-500">
              {SUPPORT_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-zinc-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-zinc-100 pt-6 text-center">
          <p className="text-xs text-zinc-500">
            &copy; {year} Olde Money Printshop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
