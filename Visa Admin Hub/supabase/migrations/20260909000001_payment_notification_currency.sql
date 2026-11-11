-- The payment_received notification body hardcoded "$" from before the `currency`
-- column existed (added in 20260805000001_application_currency.sql). Option 1
-- (Standard) and Option 3 (Ajnabi) charge GBP, so their notifications were showing
-- e.g. "$66.00" instead of "£66.00". Use NEW.currency to pick the right symbol.
CREATE OR REPLACE FUNCTION public.on_application_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- New application submitted (first insert with reference set)
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_all_staff(
      'application_submitted',
      'New application: ' || NEW.full_name,
      NEW.nationality || ' — ' || NEW.type || ' — Ref: ' || NEW.reference,
      NEW.id
    );
  END IF;

  -- Payment confirmed
  IF TG_OP = 'UPDATE' AND NEW.paid = true AND OLD.paid = false THEN
    PERFORM public.notify_all_staff(
      'payment_received',
      'Payment received: ' || NEW.full_name,
      'Ref ' || NEW.reference || ' — ' || (CASE NEW.currency WHEN 'gbp' THEN '£' ELSE '$' END) || NEW.fee,
      NEW.id
    );
  END IF;

  -- Application approved
  IF TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    PERFORM public.notify_all_staff(
      'application_approved',
      'eVisa approved: ' || NEW.full_name,
      'Ref ' || NEW.reference,
      NEW.id
    );
  END IF;

  -- Application rejected
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
