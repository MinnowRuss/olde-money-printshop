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
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Dropdown menu */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white shadow-sm transition-all duration-200 ease-in-out ${
          open
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                {label}
              </Link>
            ))}

            <div className="my-2 border-t border-zinc-100" />

            {isLoggedIn ? (
              <>
                <Link
                  href="/user"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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
                onClick={() => setOpen(false)}
                className="mx-3 mt-1 inline-flex h-8 items-center justify-center rounded-[min(var(--radius-md),12px)] bg-primary px-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
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
