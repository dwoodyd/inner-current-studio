-- Restore EXECUTE on has_role to authenticated: it's used inside RLS policies
-- on user_roles (and elsewhere), so the caller must be able to execute it.
-- It's SECURITY DEFINER and only reads user_roles, so re-granting is safe.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- has_active_subscription / has_active_trial are also used inside RLS policies
-- on other tables; grant back to authenticated so those policies can evaluate.
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_trial(uuid) TO authenticated;