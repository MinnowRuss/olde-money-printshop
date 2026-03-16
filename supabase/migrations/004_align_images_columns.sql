-- ============================================================
-- Migration 004: Align images table columns with application code
-- ============================================================

-- Rename size_bytes to file_size (matches code references)
ALTER TABLE public.images RENAME COLUMN size_bytes TO file_size;

-- Add mime_type column (used by upload, rotate, and flip routes)
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS mime_type TEXT;
