import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazily-initialized Stripe client.
 * Returns null if STRIPE_SECRET_KEY is not configured.
 */
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null

  _stripe = new Stripe(key, {
    apiVersion: '2026-02-25.clover',
  })

  return _stripe
}
