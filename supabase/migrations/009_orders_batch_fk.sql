-- ============================================================
-- 009 — Add print_batch_id FK column to orders table
-- Must run AFTER 008_print_batches.sql
-- Spec Ref: §5.1, §5.4
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS print_batch_id UUID REFERENCES print_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_print_batch_id ON orders (print_batch_id);
