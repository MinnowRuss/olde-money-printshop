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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_10px_30px_rgba(0,116,228,0.35)]">
            OMP
          </span>
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--free-game-yellow-bright)]">
              Print Studio
            </span>
            <span className="block text-base font-semibold tracking-tight text-foreground">
              Olde Money Printing
            </span>
          </span>
        </Link>

        <MobileNav isLoggedIn={!!user} />

        <nav className="hidden items-center gap-7 text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-primary-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartBadge />

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/user"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary-foreground"
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
              className="hidden h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(0,116,228,0.3)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)] md:inline-flex"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
