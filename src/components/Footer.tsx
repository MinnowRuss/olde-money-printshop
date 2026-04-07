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
    <footer className="border-t border-white/10 bg-black/50">
      <div className="page-shell py-12 sm:py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="eyebrow">Olde Money Printshop</p>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              Premium print commerce, tuned for image-first browsing.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Museum-quality photo prints with sharper hierarchy, darker
              surfaces, and a cleaner path from upload to checkout.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Stay Updated
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Promotions, print tips, and new product drops.
              </p>
              <div className="relative mt-3 max-w-sm">
                <FooterSignup />
              </div>
            </div>
            <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary-foreground"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Shop
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {SHOP_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Learn
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {LEARN_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Support
            </p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {SUPPORT_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} Olde Money Printing. All rights reserved.
          </p>
          <p>Dark commerce system inspired by the new project design brief.</p>
        </div>
      </div>
    </footer>
  )
}
