import { config } from './config.js'

/**
 * HTTP client for communicating batch status updates back to the Next.js API.
 */

interface StatusUpdate {
  status: string
  ippJobId?: string
  errorMessage?: string
  pdfStoragePath?: string
}

interface ApiResponse {
  batchId: string
  status: string
  message: string
}

export async function updateBatchStatus(
  batchId: string,
  update: StatusUpdate
): Promise<ApiResponse> {
  const url = `${config.appBaseUrl}/api/admin/print-batches/${batchId}/status`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.printAgentSecret}`,
    },
    body: JSON.stringify(update),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }

  return res.json() as Promise<ApiResponse>
}

interface BatchDetail {
  id: string
  status: string
  media_type_slug: string
  roll_width_in: number
  manifest: unknown
  pdf_storage_path: string | null
  pdfUrl: string | null
  order_ids: string[]
}

export async function fetchBatchDetail(batchId: string): Promise<BatchDetail> {
  const url = `${config.appBaseUrl}/api/admin/print-batches/${batchId}`

  // This endpoint uses admin cookie auth; for the agent we use the
  // service client directly via Supabase instead. This function is
  // here as a utility if needed in future.
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.printAgentSecret}`,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }

  return res.json() as Promise<BatchDetail>
}
