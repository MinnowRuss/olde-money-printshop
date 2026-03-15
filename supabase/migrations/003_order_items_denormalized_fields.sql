-- ============================================================
-- Migration 003: Add denormalized fields to order_items + cart_items
-- These fields are already written by the Stripe webhook but
-- may not exist in the schema yet.
-- ============================================================

-- order_items: add denormalized product info for history display
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS media_type_slug  TEXT,
  ADD COLUMN IF NOT EXISTS media_type_name  TEXT,
  ADD COLUMN IF NOT EXISTS print_size       TEXT,
  ADD COLUMN IF NOT EXISTS option_slugs     TEXT[],
  ADD COLUMN IF NOT EXISTS option_names     TEXT[],
  ADD COLUMN IF NOT EXISTS discount_pct     NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total            NUMERIC(10, 2);

-- cart_items: same denormalized fields for cart display
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS media_type_slug  TEXT,
  ADD COLUMN IF NOT EXISTS media_type_name  TEXT,
  ADD COLUMN IF NOT EXISTS print_size       TEXT,
  ADD COLUMN IF NOT EXISTS option_slugs     TEXT[],
  ADD COLUMN IF NOT EXISTS option_names     TEXT[],
  ADD COLUMN IF NOT EXISTS discount_pct     NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total            NUMERIC(10, 2);

-- ============================================================
-- Admin RLS: allow service-role (admin) to update orders
-- The service client bypasses RLS, but we also add a policy
-- so admin users can read all orders/items from server components
-- ============================================================

-- Admins can read all orders (checked via profiles.is_admin)
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Admins can update any order (status, tracking)
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Admins can read all images (for thumbnails in admin views)
CREATE POLICY "Admins can view all images"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Admins can read all profiles (for customer info in admin views)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
