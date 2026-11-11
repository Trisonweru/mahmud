-- ============================================================
-- Kenya eTA — additional applicant/declaration fields.
-- Kenya's application form collects more than eVisaSomali's did
-- (emergency contact, marital status/occupation, accommodation,
-- and the standard eTA compliance declarations) — these have no
-- Somalia-schema equivalent, so they're added here rather than
-- forced into existing columns.
-- ============================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS country_of_birth              text,
  ADD COLUMN IF NOT EXISTS nationality_at_birth           text,
  ADD COLUMN IF NOT EXISTS marital_status                 text,
  ADD COLUMN IF NOT EXISTS occupation                     text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name         text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone        text,
  ADD COLUMN IF NOT EXISTS emergency_contact_email        text,
  ADD COLUMN IF NOT EXISTS accommodation_name             text,
  ADD COLUMN IF NOT EXISTS accommodation_address          text,
  ADD COLUMN IF NOT EXISTS third_party_financed           boolean,
  ADD COLUMN IF NOT EXISTS third_party_details            text,
  ADD COLUMN IF NOT EXISTS carrying_over_10k              boolean,
  ADD COLUMN IF NOT EXISTS convicted_5_years              boolean,
  ADD COLUMN IF NOT EXISTS conviction_details             text,
  ADD COLUMN IF NOT EXISTS denied_entry                   boolean,
  ADD COLUMN IF NOT EXISTS denied_entry_details           text,
  ADD COLUMN IF NOT EXISTS visited_more_than_three         boolean,
  ADD COLUMN IF NOT EXISTS biometric_consent              boolean NOT NULL DEFAULT false;
