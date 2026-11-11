-- One-off data fix for notifications generated before 20260909000001. Every
-- payment_received notification (one row per recipient) shows "$" regardless of
-- the linked application's actual currency; correct the ones tied to GBP
-- applications (Option 1 Standard, Option 3 Ajnabi) to "£".
UPDATE public.notifications n
SET body = replace(n.body, ' — $', ' — £')
FROM public.applications a
WHERE n.application_id = a.id
  AND n.type = 'payment_received'
  AND a.currency = 'gbp'
  AND n.body LIKE '%— $%';
