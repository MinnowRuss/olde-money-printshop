-- ============================================================
-- 007 — Extend order statuses for print pipeline + add verification columns
-- Spec Ref: §3.2, §5.1, §5.4, §14 Phase 1
-- ============================================================

-- 1. Drop the existing CHECK constraint on orders.status
--    (created in 001_initial_schema.sql as inline CHECK)
ALTER TABLE orders DROP CONSTRAINT orders_status_check;

-- 2. Re-add with the full print-pipeline status flow
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',      -- order placed, awaiting payment confirmation
    'processing',   -- payment confirmed, awaiting admin review
    'verified',     -- admin verified print-readiness
    'queued',       -- added to a print batch
    'printing',     -- batch sent to printer
    'printed',      -- print job completed
    'shipped',      -- package shipped to customer
    'delivered',    -- package delivered
    'cancelled'     -- order cancelled
  ));

-- 3. Add verification columns (APP-11)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS verified_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by   UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS print_notes   TEXT;

-- 4. Admin RLS policies for orders
--    (service client bypasses RLS, but admin UI uses the auth client)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders"
      ON orders FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    CREATE POLICY "Admins can update all orders"
      ON orders FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END
$$;
