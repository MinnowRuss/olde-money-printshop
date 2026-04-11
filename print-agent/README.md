# Olde Money Print Agent

Local macOS print agent for the Automated Print Pipeline. Listens for
`submitted` print batches via Supabase Realtime (with a 30 s fallback poll),
renders the batch PDF locally using the nesting manifest, and submits it to
the Epson SC-P9500 over CUPS/IPP.

Spec: `feature/automated-print-pipeline/Automated-Print-Pipeline-Spec.docx`
(phase 3, §7).

---

## Why the PDF renders on the agent

The main app runs on Vercel Hobby, which has a 10 s function timeout and a
256 MB memory ceiling — not enough headroom to stream a multi-page PDF from a
nesting manifest. The agent already downloads the manifest to submit it to the
printer, so it also runs `pdfkit` locally, uploads the finished PDF to the
`print-batches` Supabase bucket, and then submits it to CUPS. No Edge
Function needed.

---

## Prerequisites

- macOS with the target printer already added in **System Settings ▸ Printers**
- Node.js 20+ (`which node` for the absolute path you'll paste into the plist)
- Supabase service role key and the shared `PRINT_AGENT_SECRET`

## Install

```bash
cd print-agent
npm install
```

Create `.env` in this directory:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PRINT_AGENT_SECRET=<same value as Vercel env>
APP_BASE_URL=https://oldemoneyprint.shop

# Optional — defaults to the system default printer
# CUPS_PRINTER=EPSON_SC_P9500_Series
# CUPS_POLL_INTERVAL_MS=5000
# FALLBACK_POLL_INTERVAL_MS=30000
```

## Run manually (development)

```bash
npm run dev    # tsx watch
npm start      # tsx (no watch)
```

Graceful shutdown: `Ctrl-C` (SIGINT) or `kill` (SIGTERM) — the agent removes
its Realtime channel and clears the fallback timer before exiting.

---

## Install as a LaunchAgent (auto-start on login)

The agent is distributed as a **LaunchAgent** (not a LaunchDaemon) so it runs
inside the user's session and inherits the user's CUPS printer configuration.

1. Copy the template plist to `~/Library/LaunchAgents`:

   ```bash
   cp com.oldemoney.print-agent.plist ~/Library/LaunchAgents/
   ```

2. Edit the copy and replace the two placeholders:

   - `__ABSOLUTE_PATH_TO_NODE__` → output of `which node` (e.g.
     `/opt/homebrew/bin/node` on Apple Silicon,
     `/usr/local/bin/node` on Intel)
   - `__ABSOLUTE_PATH_TO_PRINT_AGENT__` → the absolute path to this folder
     (e.g. `/Users/russ/Code/olde-money-printshop/print-agent`)

   The plist appears in three places: `ProgramArguments`, `WorkingDirectory`,
   and the two log paths.

3. Create the log folder referenced by the plist:

   ```bash
   mkdir -p logs
   ```

4. Load the agent:

   ```bash
   launchctl load ~/Library/LaunchAgents/com.oldemoney.print-agent.plist
   ```

   It will start immediately (`RunAtLoad=true`) and restart on crash
   (`KeepAlive.Crashed=true`) with a 30 s throttle.

### Verify it's running

```bash
launchctl list | grep com.oldemoney.print-agent
tail -f logs/print-agent.out.log
```

You should see `[print-agent] Starting…`, followed by `[poll] Found 0 submitted
batch(es)` from the first fallback poll.

### Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.oldemoney.print-agent.plist
rm ~/Library/LaunchAgents/com.oldemoney.print-agent.plist
```

### Laptop-sleep caveat (OQ-3)

The workstation is expected to sometimes be off/asleep. LaunchAgents don't
wake the machine. When the laptop comes back online, the fallback poll picks
up any `submitted` batches that arrived while it was away, so nothing is
lost — but the customer-facing ETA should reflect that prints can be delayed
by several hours. The web UI uses a 4 h (not 2 h) threshold before flagging
a batch as stuck in `submitted`.

---

## Retry behaviour

Per spec §7.3 / F-12, the two transient-failure points are retried 3 times
with exponential backoff (2 s, 4 s):

- **PDF generation** — wraps `renderBatchPdf()`. Retries cover transient
  Supabase Storage download failures while fetching source images.
- **CUPS submission** — wraps `printPdf()`. Retries cover transient `lp`
  failures (printer busy, CUPS daemon restart).

After 3 failed attempts the batch transitions to `failed` with an error
message that includes `after 3 attempts`, and the admin UI surfaces it for
manual retry. See `batch-processor.ts` → `retryWithBackoff`.

CUPS job polling (`waitForJobCompletion`) is *not* retried — it's a
10-minute timer, not a network call. A timeout there means the printer
actually failed, and the batch is marked `failed` directly.

---

## CUPS command (F-02)

`cups.ts` submits jobs with the canonical command from spec §4.4:

```
lp -d <printer> \
   -o media=Custom.<W>inx<H>in \
   -o fit-to-page=false \
   -o sides=one-sided \
   <file>
```

The nesting engine has already sized the page to the roll width and run-length,
so `fit-to-page=false` is required — we do **not** want CUPS to rescale the
final layout.

---

## Useful commands

```bash
# See the system default printer
lpstat -d

# See all printers known to CUPS
lpstat -p

# Cancel a stuck job (use the ID from lpstat, e.g. EPSON_SC_P9500-42)
cancel <job-id>

# Print a test page to verify the printer is reachable
lp -d <printer> /System/Library/Frameworks/ImageIO.framework/Resources/ColorSync.icc
```
