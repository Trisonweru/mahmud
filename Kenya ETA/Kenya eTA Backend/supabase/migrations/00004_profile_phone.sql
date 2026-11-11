-- ============================================================
-- Kenya eTA — staff profile phone number.
-- Found missing by comparing against eVisaSomali's live `profiles` table,
-- which has this column despite no migration ever adding it (added via the
-- Supabase dashboard at some point) — the admin console's staff settings
-- page reads/writes profiles.phone, so it must exist here too.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;
