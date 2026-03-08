import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

        {/* Nav links — hidden on mobile for now */}
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
          {/* Cart icon with badge (hardcoded 0 — Phase 5 will wire real count) */}
          <Link href="/order" className="relative inline-flex items-center p-1 text-zinc-600 hover:text-zinc-900">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
              0
            </span>
          </Link>

          {user ? (
            <form action="/auth/logout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/auth/login" className={cn(buttonVariants({ size: 'sm' }))}>
              Sign in
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
