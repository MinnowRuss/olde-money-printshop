import 'dotenv/config'

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceKey: required('SUPABASE_SERVICE_ROLE_KEY'),

  /** Shared secret for authenticating with the Next.js API */
  printAgentSecret: required('PRINT_AGENT_SECRET'),

  /** Base URL of the Next.js app (e.g. https://printing.oldemoney.com) */
  appBaseUrl: required('APP_BASE_URL'),

  /** CUPS printer name (from `lpstat -p`). Defaults to system default. */
  cupsprinter: process.env.CUPS_PRINTER ?? '',

  /** Poll interval in ms for checking CUPS job completion */
  cupsPollIntervalMs: Number(process.env.CUPS_POLL_INTERVAL_MS ?? '5000'),

  /** How often to poll for missed batches (fallback to Realtime) */
  fallbackPollIntervalMs: Number(process.env.FALLBACK_POLL_INTERVAL_MS ?? '30000'),
} as const
