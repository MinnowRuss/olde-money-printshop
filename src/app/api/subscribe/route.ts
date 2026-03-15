import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 },
      )
    }

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 },
      )
    }

    if (resend && process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email: trimmed,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      })
    } else {
      console.log('[subscribe] New subscriber (Resend not configured):', trimmed)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[subscribe] Error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    )
  }
}
