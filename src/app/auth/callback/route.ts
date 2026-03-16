import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the Supabase auth callback for email confirmation and password-reset flows.
 * Supabase redirects here with a `code` query-param that must be exchanged for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/image?welcome=1'

  // Prevent open-redirect: only allow safe relative paths
  const isSafePath =
    next.startsWith('/') &&        // must be a relative path
    !next.startsWith('//') &&      // block protocol-relative URLs
    !/^\/\\/.test(next) &&         // block /\ which some browsers treat as //
    !next.includes(':')            // block javascript: or other schemes embedded in path
  const safeNext = isSafePath ? next : '/image?welcome=1'

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_code', request.url),
    )
  }

  const supabase = await createClient()

  if (!supabase) {
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error', request.url),
    )
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url),
    )
  }

  return NextResponse.redirect(new URL(safeNext, request.url))
}
