-- ============================================================
-- Kenya eTA — Full schema (baseline, adapted from eVisaSomali's
-- Visa Admin Hub schema at its final migrated state)
-- ============================================================

-- Enums
CREATE TYPE public.application_status AS ENUM (
  'pending_payment','awaiting_etas','submitted','in_review',
  'additional_info','approved','rejected','refunded'
);
CREATE TYPE public.application_type AS ENUM ('standard','express');
CREATE TYPE public.document_type   AS ENUM (
  'passport','photo','accommodation_booking','airline_booking',
  'invitation_letter','host_identity_card','other'
);
CREATE TYPE public.notification_type AS ENUM (
  'application_submitted','payment_received','etas_overdue',
  'application_approved','application_rejected','note_added'
);
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','officer');

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name   text,
  email       text,
  avatar_url  text,
  position    text,
  department  text,
  start_date  date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read_profiles"  ON public.profiles FOR SELECT  USING (auth.role() = 'authenticated');
CREATE POLICY "own_profile_update"   ON public.profiles FOR UPDATE  USING (auth.uid() = id);

-- ── User roles ────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read_roles" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "superadmin_manage_roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

-- ── Reference number generator (KEN-###### for Kenya) ──────────
CREATE OR REPLACE FUNCTION public.generate_reference()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  ref text;
  done bool := false;
BEGIN
  WHILE NOT done LOOP
    ref := 'KEN-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    done := NOT EXISTS (SELECT 1 FROM public.applications WHERE reference = ref);
  END LOOP;
  RETURN ref;
END;
$$;

-- ── Applications ──────────────────────────────────────────────
CREATE TABLE public.applications (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            text NOT NULL DEFAULT '',
  full_name            text NOT NULL,
  email                text NOT NULL,
  phone                text,
  nationality          text NOT NULL,
  passport_number      text NOT NULL,
  passport_issue_date  date,
  passport_expiry      date NOT NULL,
  dob                  date NOT NULL,
  arrival_date         date NOT NULL,
  departure_date       date NOT NULL,
  purpose              text NOT NULL,
  address_in_country   text NOT NULL,
  type                 public.application_type NOT NULL DEFAULT 'standard',
  processing_speed     text NOT NULL DEFAULT 'standard' CHECK (processing_speed IN ('standard','express')),
  fee                  numeric(10,2) NOT NULL DEFAULT 70,
  currency             text NOT NULL DEFAULT 'usd',
  status               public.application_status NOT NULL DEFAULT 'pending_payment',
  paid                 boolean NOT NULL DEFAULT false,
  paid_at              timestamptz,
  submitted_at         timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz,
  assigned_to          uuid REFERENCES auth.users ON DELETE SET NULL,
  etas_submitted       boolean NOT NULL DEFAULT false,
  etas_reference       text,
  etas_submitted_at    timestamptz,
  etas_submitted_by    uuid REFERENCES auth.users ON DELETE SET NULL,
  claimed_by           uuid REFERENCES public.profiles ON DELETE SET NULL,
  claimed_at           timestamptz,
  refund_requested_at  timestamptz,
  refund_requested_by  uuid REFERENCES public.profiles ON DELETE SET NULL,
  refund_reason        text,
  refund_status        text CHECK (refund_status IN ('requested','approved','rejected','refunded')),
  refund_amount        numeric(10,2),
  refund_processed_at  timestamptz,
  stripe_payment_intent_id text,
  stripe_customer_id       text
);

-- Index for the queue claim-lock filter (claimed_by IS NULL OR claimed_by = me OR expired)
CREATE INDEX IF NOT EXISTS idx_applications_claim
  ON public.applications (claimed_by, claimed_at)
  WHERE etas_submitted = false AND paid = true;

-- Auto-assign reference on insert
CREATE OR REPLACE FUNCTION public.set_application_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := public.generate_reference();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_set_reference
  BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_application_reference();

-- Auto-set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Claim-lock enforcement: on ETAS submission, enforce claim ownership and clear it.
CREATE OR REPLACE FUNCTION public.enforce_etas_claim_ownership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_is_super_admin boolean;
BEGIN
  IF NOT (NEW.etas_submitted = TRUE AND COALESCE(OLD.etas_submitted, FALSE) = FALSE) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    NEW.claimed_by := NULL;
    NEW.claimed_at := NULL;
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) INTO v_is_super_admin;

  IF NOT v_is_super_admin
     AND OLD.claimed_by IS NOT NULL
     AND OLD.claimed_by != auth.uid()
     AND OLD.claimed_at > (now() - interval '20 minutes') THEN
    RAISE EXCEPTION
      'Application % is currently being processed by another officer. Wait for the lock to expire.',
      OLD.reference;
  END IF;

  NEW.claimed_by := NULL;
  NEW.claimed_at := NULL;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_enforce_etas_claim
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_etas_claim_ownership();

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
-- Only authenticated staff can read/write applications
CREATE POLICY "staff_all_applications" ON public.applications
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Application documents ─────────────────────────────────────
CREATE TABLE public.application_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications ON DELETE CASCADE,
  doc_type       public.document_type NOT NULL,
  file_name      text NOT NULL,
  storage_path   text NOT NULL,
  mime_type      text,
  size_bytes     bigint,
  uploaded_at    timestamptz NOT NULL DEFAULT now(),
  uploaded_by    uuid REFERENCES auth.users ON DELETE SET NULL
);
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all_documents" ON public.application_documents
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Application notes ─────────────────────────────────────────
CREATE TABLE public.application_notes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications ON DELETE CASCADE,
  author_id      uuid REFERENCES auth.users ON DELETE SET NULL,
  body           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all_notes" ON public.application_notes
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE public.notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id   uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type           public.notification_type NOT NULL,
  title          text NOT NULL,
  body           text,
  application_id uuid REFERENCES public.applications ON DELETE SET NULL,
  read_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (auth.uid() = recipient_id);

-- ── Notify all staff helper ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_all_staff(
  p_type    public.notification_type,
  p_title   text,
  p_body    text DEFAULT NULL,
  p_app_id  uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, title, body, application_id)
  SELECT DISTINCT ur.user_id, p_type, p_title, p_body, p_app_id
  FROM public.user_roles ur;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_all_staff(public.notification_type, text, text, uuid) FROM PUBLIC, anon, authenticated;

-- ── Application change trigger → notifications ─────────────────
CREATE OR REPLACE FUNCTION public.on_application_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_all_staff(
      'application_submitted',
      'New application: ' || NEW.full_name,
      NEW.nationality || ' — ' || NEW.type || ' — Ref: ' || NEW.reference,
      NEW.id
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.paid = true AND OLD.paid = false THEN
    PERFORM public.notify_all_staff(
      'payment_received',
      'Payment received: ' || NEW.full_name,
      'Ref ' || NEW.reference || ' — $' || NEW.fee,
      NEW.id
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    PERFORM public.notify_all_staff(
      'application_approved',
      'eTA approved: ' || NEW.full_name,
      'Ref ' || NEW.reference,
      NEW.id
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status <> 'rejected' THEN
    PERFORM public.notify_all_staff(
      'application_rejected',
      'Application rejected: ' || NEW.full_name,
      'Ref ' || NEW.reference,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.on_application_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_application_change
  AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.on_application_change();

-- ── Auto-create profile on signup ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Realtime ──────────────────────────────────────────────────
ALTER TABLE public.notifications          REPLICA IDENTITY FULL;
ALTER TABLE public.applications           REPLICA IDENTITY FULL;
ALTER TABLE public.application_documents  REPLICA IDENTITY FULL;
ALTER TABLE public.application_notes      REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;         EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;          EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.application_documents; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.application_notes;     EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
