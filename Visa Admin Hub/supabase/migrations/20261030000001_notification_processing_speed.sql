-- Staff notifications labelled every quick-apply application "express" because
-- they printed applications.type, which records the form used (quick-apply vs
-- guided), not the speed the applicant paid for. Use processing_speed instead.
CREATE OR REPLACE FUNCTION public.on_application_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- New application submitted (first insert with reference set)
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_all_staff(
      'application_submitted',
      'New application: ' || NEW.full_name,
      NEW.nationality || ' — ' || (CASE NEW.processing_speed WHEN 'express' THEN 'Express' ELSE 'Standard' END) || ' — Ref: ' || NEW.reference,
      NEW.id
    );
  END IF;

  -- Payment confirmed
  IF TG_OP = 'UPDATE' AND NEW.paid = true AND OLD.paid = false THEN
    PERFORM public.notify_all_staff(
      'payment_received',
      'Payment received: ' || NEW.full_name,
      'Ref ' || NEW.reference || ' — ' || (CASE NEW.processing_speed WHEN 'express' THEN 'Express' ELSE 'Standard' END) || ' — ' || (CASE NEW.currency WHEN 'gbp' THEN '£' ELSE '$' END) || NEW.fee,
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
$function$

;
