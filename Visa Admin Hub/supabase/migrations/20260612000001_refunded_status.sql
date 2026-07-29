-- Add a "refunded" application status (#8/#14/#16) and a timestamp for when a
-- refund was processed, recorded alongside the existing refund_amount column.
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_processed_at timestamptz;
