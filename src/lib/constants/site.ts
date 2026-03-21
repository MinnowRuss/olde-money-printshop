export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_URL || 'https://printing.oldemoney.com'

/** Maximum file size (in bytes) for server-side image processing (flip/rotate). */
export const MAX_IMAGE_PROCESS_SIZE = 30 * 1024 * 1024 // 30 MB
