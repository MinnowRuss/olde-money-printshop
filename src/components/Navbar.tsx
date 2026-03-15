import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import CartBadge from '@/components/CartBadge'
import MobileNav from '@/components/MobileNav'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/prices', label: 'Prices' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/contact', label: 'Contact' },
]

export default async function Navbar() {
  const supabase = await createClient()
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900"
        >
          <span className="text-lg">Olde Money Printshop</span>
        </Link>

        {/* Mobile hamburger menu */}
        <MobileNav isLoggedIn={!!user} />

        {/* Nav links — hidden on mobile */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-zinc-900"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-3">
          {/* Cart icon with live badge */}
          <CartBadge />

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/user"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Account
              </Link>
              <form action="/auth/logout" method="POST">
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80 md:inline-flex"
            >
              Sign in
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
