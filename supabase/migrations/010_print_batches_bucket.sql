-- ============================================================
-- Migration 010: Create print-batches storage bucket
-- Stores generated PDFs from the print-agent (batch-processor.ts)
-- Private bucket — only service role writes; admin reads via signed URLs.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'print-batches',
  'print-batches',
  false,
  524288000,  -- 500 MB (large-format PDFs can be hefty)
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public = EXCLUDED.public;

-- No RLS policies needed on storage.objects for this bucket:
--   • Writes: print-agent uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
--   • Reads: admin endpoint creates signed URLs via service role (routes/admin/print-batches/[id]/route.ts:62)
--   • No direct client access to this bucket from end users
