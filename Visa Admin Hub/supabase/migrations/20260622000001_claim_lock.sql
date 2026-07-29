-- Add DB-level claim lock to applications table.
-- When an officer clicks "View & Docs" in the Queue, they atomically stamp
-- claimed_by/claimed_at. Other officers' queue queries filter these rows out.
-- Lock releases on: ETAS submission (trigger below) OR 20-min idle (filter side).

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS claimed_by uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- FK to profiles so PostgREST can resolve the claimant's name via join
ALTER TABLE applications
  ADD CONSTRAINT applications_claimed_by_fkey
  FOREIGN KEY (claimed_by) REFERENCES profiles(id)
  ON DELETE SET NULL;

-- Index for the queue filter (claimed_by IS NULL OR claimed_by = me OR expired)
CREATE INDEX IF NOT EXISTS idx_applications_claim
  ON applications (claimed_by, claimed_at)
  WHERE etas_submitted = false AND paid = true;

-- Trigger: on ETAS submission, enforce claim ownership and clear the claim.
-- Fires BEFORE UPDATE so it can mutate NEW before the row is written.
CREATE OR REPLACE FUNCTION enforce_etas_claim_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super_admin boolean;
BEGIN
  -- Only intercept when etas_submitted flips to TRUE for the first time
  IF NOT (NEW.etas_submitted = TRUE AND COALESCE(OLD.etas_submitted, FALSE) = FALSE) THEN
    RETURN NEW;
  END IF;

  -- Service-role context (auth.uid() IS NULL) — bypass and clear claim
  IF auth.uid() IS NULL THEN
    NEW.claimed_by := NULL;
    NEW.claimed_at := NULL;
    RETURN NEW;
  END IF;

  -- Super admins bypass the ownership check
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) INTO v_is_super_admin;

  -- Block if another officer holds a valid (non-expired) claim
  IF NOT v_is_super_admin
     AND OLD.claimed_by IS NOT NULL
     AND OLD.claimed_by != auth.uid()
     AND OLD.claimed_at > (now() - interval '20 minutes') THEN
    RAISE EXCEPTION
      'Application % is currently being processed by another officer. Wait for the lock to expire.',
      OLD.reference;
  END IF;

  -- Clear the claim on successful submission (whoever submits)
  NEW.claimed_by := NULL;
  NEW.claimed_at := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_etas_claim ON applications;

CREATE TRIGGER trg_enforce_etas_claim
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION enforce_etas_claim_ownership();
