-- Fix "infinite recursion detected in policy for relation user_roles" (42P17).
-- The superadmin_manage_roles policy queried public.user_roles from within its
-- own USING clause, which re-triggers RLS on user_roles recursively. Move the
-- check into a SECURITY DEFINER function so the inner lookup bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_super_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'super_admin'
  );
$$;

DROP POLICY IF EXISTS "superadmin_manage_roles" ON public.user_roles;
CREATE POLICY "superadmin_manage_roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin(auth.uid()));
