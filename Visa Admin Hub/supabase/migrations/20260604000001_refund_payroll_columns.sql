-- ── Refund tracking on applications ─────────────────────────────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS refund_requested_at  timestamptz,
  ADD COLUMN IF NOT EXISTS refund_requested_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS refund_reason        text,
  ADD COLUMN IF NOT EXISTS refund_status        text CHECK (refund_status IN ('requested','approved','rejected','processed')),
  ADD COLUMN IF NOT EXISTS refund_amount        numeric(10,2);

-- ── Payroll / staff profile fields on profiles ───────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS position    text,
  ADD COLUMN IF NOT EXISTS department  text,
  ADD COLUMN IF NOT EXISTS start_date  date;
