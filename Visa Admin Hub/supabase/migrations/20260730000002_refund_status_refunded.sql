-- Rename refund_status value 'processed' -> 'refunded' for clarity (matches the
-- customer-facing status label already used on the public tracker). Also adds
-- a proper CHECK constraint — the original migration's ADD COLUMN IF NOT EXISTS
-- silently skipped its CHECK clause since the column already existed.

UPDATE public.applications SET refund_status = 'refunded' WHERE refund_status = 'processed';

ALTER TABLE public.applications
  ADD CONSTRAINT applications_refund_status_check
  CHECK (refund_status IN ('requested', 'approved', 'rejected', 'refunded'));
