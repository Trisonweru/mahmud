-- ============================================================
-- Kenya eTA — application-documents storage bucket
-- Replicates the private bucket used by eVisaSomali (not migration-
-- tracked there — recreated here from its live bucket config +
-- storage.objects RLS policies, inspected read-only via the
-- Supabase Management API).
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic','image/heif','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Staff (authenticated) can read and delete documents.
CREATE POLICY "staff_read_docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'application-documents' AND auth.role() = 'authenticated');

CREATE POLICY "staff_delete_docs" ON storage.objects
  FOR DELETE USING (bucket_id = 'application-documents' AND auth.role() = 'authenticated');

-- No INSERT policy: uploads happen exclusively via the `application-save`
-- Edge Function using the service-role key, which bypasses RLS entirely.
-- (eVisaSomali's live bucket has a public/anon INSERT policy left over from
-- an earlier iteration — intentionally not replicated here, since nothing
-- other than the service-role edge function should ever write to this
-- bucket.)
