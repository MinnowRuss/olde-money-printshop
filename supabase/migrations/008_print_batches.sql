-- ============================================================
-- 008 — Create print_batches table
-- Spec Ref: §4.2, §5.2, §5.4
-- ============================================================

CREATE TABLE IF NOT EXISTS print_batches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  media_type_slug     TEXT NOT NULL,
  roll_width_in       NUMERIC(5,1) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'submitted', 'printing', 'completed', 'failed')),
  order_ids           UUID[] NOT NULL DEFAULT '{}',
  manifest            JSONB NOT NULL DEFAULT '[]'::jsonb,
  pdf_storage_path    TEXT,
  estimated_length_in NUMERIC(8,2),
  ipp_job_id          TEXT,
  error_message       TEXT,
  completed_at        TIMESTAMPTZ,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_print_batches_status_date ON print_batches (status, batch_date);
CREATE INDEX idx_print_batches_order_ids ON print_batches USING GIN (order_ids);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_print_batches_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_print_batches_updated_at
  BEFORE UPDATE ON print_batches
  FOR EACH ROW EXECUTE FUNCTION update_print_batches_updated_at();

-- RLS
ALTER TABLE print_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on print_batches"
  ON print_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Enable Realtime for print agent subscription
ALTER PUBLICATION supabase_realtime ADD TABLE print_batches;
