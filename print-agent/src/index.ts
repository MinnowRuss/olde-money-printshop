import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'
import { processBatch, pollForSubmittedBatches } from './batch-processor.js'

console.log('─────────────────────────────────────')
console.log(' Olde Money Print Agent v0.1.0')
console.log('─────────────────────────────────────')
console.log(`  Supabase: ${config.supabaseUrl}`)
console.log(`  App:      ${config.appBaseUrl}`)
console.log(`  Printer:  ${config.cupsprinter || '(system default)'}`)
console.log(`  Poll:     every ${config.fallbackPollIntervalMs / 1000}s`)
console.log('─────────────────────────────────────')

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

// ── Supabase Realtime subscription ──────────────────────────
// Listen for print_batches rows transitioning to 'submitted'.
// The admin UI calls POST .../submit which flips queued→submitted,
// triggering this subscription.

const channel = supabase
  .channel('print-agent')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'print_batches',
      filter: 'status=eq.submitted',
    },
    (payload) => {
      const batchId = payload.new?.id as string | undefined
      if (!batchId) return

      console.log(`[realtime] Batch ${batchId.slice(0, 8)} → submitted`)
      processBatch(batchId).catch((err) =>
        console.error(`[realtime] Error processing batch ${batchId}:`, err)
      )
    }
  )
  .subscribe((status) => {
    console.log(`[realtime] Subscription status: ${status}`)
  })

// ── Fallback polling ────────────────────────────────────────
// In case Realtime misses an event (network blip, agent restart).

const pollInterval = setInterval(() => {
  pollForSubmittedBatches()
}, config.fallbackPollIntervalMs)

// Run once on startup to catch anything submitted while agent was down
pollForSubmittedBatches()

// ── Graceful shutdown ───────────────────────────────────────

function shutdown() {
  console.log('\n[agent] Shutting down...')
  clearInterval(pollInterval)
  supabase.removeChannel(channel)
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
