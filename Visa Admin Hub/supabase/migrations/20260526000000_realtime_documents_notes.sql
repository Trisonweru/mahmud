ALTER TABLE public.application_documents REPLICA IDENTITY FULL;
ALTER TABLE public.application_notes REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.application_documents; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.application_notes; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
