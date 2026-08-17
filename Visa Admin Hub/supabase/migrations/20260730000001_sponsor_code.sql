-- Sponsor code (foreign/Ajnabi applicants) was being collected on the guided
-- form but silently discarded by the backend — never persisted anywhere.
-- Adding a first-class column instead of the free-text-note workaround.
ALTER TABLE public.applications
  ADD COLUMN sponsor_code text;
