'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/prices', label: 'Prices' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/contact', label: 'Contact' },
]

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [openPathname, setOpenPathname] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const open = openPathname === pathname

  // Close on outside click
  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpenPathname(null)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        onClick={() => setOpenPathname((prev) => (prev === pathname ? null : pathname))}
        className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Dropdown menu */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 top-16 z-50 border-b border-white/10 bg-background/96 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-all duration-200 ease-in-out ${
          open
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <nav className="page-shell py-5">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpenPathname(null)}
                className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                {label}
              </Link>
            ))}

            <div className="my-2 border-t border-border/70" />

            {isLoggedIn ? (
              <>
                <Link
                  href="/user"
                  onClick={() => setOpenPathname(null)}
                  className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                >
                  Account
                </Link>
                <form action="/auth/logout" method="POST" className="px-3 pt-1">
                  <Button variant="outline" size="sm" type="submit" className="w-full">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpenPathname(null)}
                className="mx-3 mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(0,116,228,0.3)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)]"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
