import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const STORE_EMAIL = 'orders@oldemoneyprintshop.com'
const FROM_EMAIL = 'Olde Money Printshop <noreply@oldemoneyprintshop.com>'

const VALID_SUBJECTS = [
  'General Question',
  'Order Issue',
  'Custom Quote',
  'Drop Shipping',
]

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const { firstName, lastName, email, subject, message, honeypot } =
    body as Record<string, unknown>

  // Honeypot check - silently succeed to avoid tipping off bots
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return NextResponse.json({ success: true })
  }

  // Validate required fields
  if (
    typeof firstName !== 'string' ||
    !firstName.trim() ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    typeof message !== 'string' ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 },
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: 'Please provide a valid email address.' },
      { status: 400 },
    )
  }

  // Validate subject is one of the allowed options
  if (!VALID_SUBJECTS.includes(subject)) {
    return NextResponse.json(
      { error: 'Invalid subject selection.' },
      { status: 400 },
    )
  }

  // Enforce reasonable field lengths
  if (firstName.trim().length > 100) {
    return NextResponse.json(
      { error: 'First name is too long.' },
      { status: 400 },
    )
  }
  if (lastName.trim().length > 100) {
    return NextResponse.json(
      { error: 'Last name is too long.' },
      { status: 400 },
    )
  }
  if (email.trim().length > 320) {
    return NextResponse.json(
      { error: 'Email address is too long.' },
      { status: 400 },
    )
  }
  if (message.trim().length > 5000) {
    return NextResponse.json(
      { error: 'Message is too long (max 5,000 characters).' },
      { status: 400 },
    )
  }

  const sanitizedFirstName = firstName.trim()
  const sanitizedLastName = lastName.trim()
  const sanitizedEmail = email.trim()
  const sanitizedMessage = message.trim()

  // Send emails via Resend if configured
  if (resend) {
    try {
      // Notification to the store
      await resend.emails.send({
        from: FROM_EMAIL,
        to: STORE_EMAIL,
        subject: `Contact Form: ${subject} — ${sanitizedFirstName} ${sanitizedLastName}`,
        replyTo: sanitizedEmail,
        text: [
          `New contact form submission`,
          ``,
          `Name: ${sanitizedFirstName} ${sanitizedLastName}`,
          `Email: ${sanitizedEmail}`,
          `Subject: ${subject}`,
          ``,
          `Message:`,
          sanitizedMessage,
        ].join('\n'),
      })

      // Auto-reply to customer
      await resend.emails.send({
        from: FROM_EMAIL,
        to: sanitizedEmail,
        subject: `We received your message — Olde Money Printshop`,
        text: [
          `Hi ${sanitizedFirstName},`,
          ``,
          `Thank you for reaching out to Olde Money Printshop! We've received your message and will get back to you within one business day.`,
          ``,
          `Here's a copy of what you sent us:`,
          ``,
          `Subject: ${subject}`,
          `Message: ${sanitizedMessage}`,
          ``,
          `Best regards,`,
          `The Olde Money Printshop Team`,
          `hello@oldemoneyprintshop.com`,
          `(555) 123-4567`,
        ].join('\n'),
      })
    } catch (err) {
      console.error('Failed to send email via Resend:', err)
      return NextResponse.json(
        { error: 'Failed to send your message. Please try again later.' },
        { status: 500 },
      )
    }
  } else {
    // Dev mode — log to console when Resend is not configured
    console.log('--- Contact Form Submission (no RESEND_API_KEY) ---')
    console.log(
      `Name: ${sanitizedFirstName} ${sanitizedLastName}`,
    )
    console.log(`Email: ${sanitizedEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Message: ${sanitizedMessage}`)
    console.log('---------------------------------------------------')
  }

  return NextResponse.json({ success: true })
}
