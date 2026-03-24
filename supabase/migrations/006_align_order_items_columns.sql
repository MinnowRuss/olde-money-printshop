-- ============================================================
-- Migration 006: Align order_items table with application code
-- Mirrors what migration 005 did for cart_items
-- ============================================================

-- Drop the FK constraint and media_type_id column (code uses media_type_slug instead)
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_media_type_id_fkey;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS media_type_id;

-- Drop the old options column (code uses option_slugs and option_names)
ALTER TABLE public.order_items DROP COLUMN IF EXISTS options;

-- Ensure denormalized columns exist with correct types
-- Migration 003 may have added some as TEXT[] — drop and re-add as JSONB for consistency with cart_items
ALTER TABLE public.order_items DROP COLUMN IF EXISTS option_slugs;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS option_names;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS media_type_slug  TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS media_type_name  TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS print_size       TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS option_slugs     JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS option_names     JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS discount_pct     NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total            NUMERIC(10, 2);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
