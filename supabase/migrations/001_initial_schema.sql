-- ============================================================
-- Olde Money Printshop — Initial Schema Migration
-- Run this in the Supabase SQL editor
-- ============================================================

-- -------------------------
-- profiles
-- -------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city        TEXT,
  state       TEXT,
  zip         TEXT,
  country     TEXT DEFAULT 'US',
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- -------------------------
-- images
-- -------------------------
CREATE TABLE IF NOT EXISTS images (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename       TEXT NOT NULL,
  storage_path   TEXT NOT NULL,
  thumbnail_path TEXT,
  width          INTEGER,
  height         INTEGER,
  size_bytes     BIGINT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own images"
  ON images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON images FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------
-- media_types
-- -------------------------
CREATE TABLE IF NOT EXISTS media_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE media_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media types"
  ON media_types FOR SELECT
  USING (true);

-- -------------------------
-- options
-- -------------------------
CREATE TABLE IF NOT EXISTS options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type_id UUID NOT NULL REFERENCES media_types(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  extra_cost    NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view options"
  ON options FOR SELECT
  USING (true);

-- -------------------------
-- price_tiers
-- -------------------------
CREATE TABLE IF NOT EXISTS price_tiers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type_id UUID NOT NULL REFERENCES media_types(id) ON DELETE CASCADE,
  min_width     INTEGER NOT NULL,
  max_width     INTEGER NOT NULL,
  min_height    INTEGER NOT NULL,
  max_height    INTEGER NOT NULL,
  base_price    NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price tiers"
  ON price_tiers FOR SELECT
  USING (true);

-- -------------------------
-- cart_items
-- -------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id      UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  media_type_id UUID NOT NULL REFERENCES media_types(id),
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  crop_data     JSONB,
  options       JSONB DEFAULT '[]'::jsonb,
  unit_price    NUMERIC(10, 2) NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------
-- orders
-- -------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total             NUMERIC(10, 2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number   TEXT,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------
-- order_items
-- -------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_id      UUID REFERENCES images(id) ON DELETE SET NULL,
  media_type_id UUID NOT NULL REFERENCES media_types(id),
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  crop_data     JSONB,
  options       JSONB DEFAULT '[]'::jsonb,
  unit_price    NUMERIC(10, 2) NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
  );

-- ============================================================
-- Seed: default media types (safe to run multiple times)
-- ============================================================
INSERT INTO media_types (name, slug, description) VALUES
  ('Standard Print', 'standard-print', 'Lustre or gloss finish print on photo paper'),
  ('Canvas Wrap',    'canvas-wrap',    'Gallery-wrapped canvas, ready to hang'),
  ('Metal Print',    'metal-print',    'Aluminum sheet with vivid color reproduction')
ON CONFLICT (slug) DO NOTHING;
