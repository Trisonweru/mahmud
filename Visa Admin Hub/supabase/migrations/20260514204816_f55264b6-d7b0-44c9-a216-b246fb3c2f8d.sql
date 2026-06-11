
REVOKE EXECUTE ON FUNCTION public.notify_all_staff(notification_type, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_application_change() FROM PUBLIC, anon, authenticated;
