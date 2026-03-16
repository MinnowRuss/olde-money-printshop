-- ============================================================
-- Migration 005: Align cart_items table with application code
-- ============================================================

-- Drop the FK constraint and media_type_id column (code uses media_type_slug instead)
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_media_type_id_fkey;
ALTER TABLE public.cart_items DROP COLUMN IF EXISTS media_type_id;

-- Drop the old options column (code uses option_slugs and option_names)
ALTER TABLE public.cart_items DROP COLUMN IF EXISTS options;

-- Add columns the application code expects
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS media_type_slug TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS media_type_name TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS print_size TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS option_slugs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS option_names JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
