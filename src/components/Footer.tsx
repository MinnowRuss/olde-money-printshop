import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/prices', label: 'Prices' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/contact', label: 'Contact' },
]

const LEGAL_LINKS = [
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
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">

          {/* Brand + copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-zinc-900">Olde Money Printshop</p>
            <p className="mt-1 text-xs text-zinc-500">
              © {year} Olde Money Printshop. All rights reserved.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-zinc-500">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-zinc-900"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Legal links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-zinc-500">
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-zinc-900"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Social links */}
          <div className="flex gap-4 text-sm text-zinc-500">
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
      </div>
    </footer>
  )
}
