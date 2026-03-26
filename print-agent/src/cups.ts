import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { config } from './config.js'

const execFileAsync = promisify(execFile)

/**
 * Submit a PDF file to the CUPS printer via `lp`.
 * Returns the CUPS job ID string (e.g. "MyPrinter-123").
 */
export async function printPdf(filePath: string): Promise<string> {
  const args: string[] = []

  if (config.cupsprinter) {
    args.push('-d', config.cupsprinter)
  }

  // Print options for large-format roll paper
  args.push(
    '-o', 'media=Roll',
    '-o', 'fit-to-page',
    filePath
  )

  const { stdout } = await execFileAsync('lp', args)

  // lp outputs: "request id is PrinterName-123 (1 file(s))"
  const match = stdout.match(/request id is (\S+)/)
  if (!match) {
    throw new Error(`Could not parse lp output: ${stdout}`)
  }

  return match[1]
}

/**
 * Check the status of a CUPS job via `lpstat`.
 * Returns one of: 'pending', 'processing', 'completed', 'unknown'.
 */
export async function getJobStatus(
  jobId: string
): Promise<'pending' | 'processing' | 'completed' | 'unknown'> {
  try {
    // lpstat -W completed shows completed jobs
    const { stdout: completedOut } = await execFileAsync('lpstat', ['-W', 'completed'])
    if (completedOut.includes(jobId)) {
      return 'completed'
    }

    // lpstat -W not-completed shows active/pending jobs
    const { stdout: activeOut } = await execFileAsync('lpstat', ['-W', 'not-completed'])
    if (activeOut.includes(jobId)) {
      // Check if it's actively processing
      if (activeOut.includes('processing')) {
        return 'processing'
      }
      return 'pending'
    }

    // Job might have completed and been purged from history
    return 'completed'
  } catch {
    // lpstat can fail if no jobs exist — treat as completed
    return 'unknown'
  }
}

/**
 * Poll until a CUPS job completes or times out.
 * Returns true if completed, false if timed out.
 */
export async function waitForJobCompletion(
  jobId: string,
  timeoutMs: number = 600_000 // 10 min default
): Promise<boolean> {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const status = await getJobStatus(jobId)

    if (status === 'completed') return true
    if (status === 'unknown') return true // assume done

    await sleep(config.cupsPollIntervalMs)
  }

  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
