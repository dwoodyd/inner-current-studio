
-- 1. founder_lifetime_slots: remove public SELECT, restrict to owner; revoke anon GRANT
DROP POLICY IF EXISTS "Anyone can read slot count" ON public.founder_lifetime_slots;
CREATE POLICY "Users can view their own slot"
  ON public.founder_lifetime_slots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
REVOKE SELECT ON public.founder_lifetime_slots FROM anon;

-- 2. founding_member_applications: restrict INSERT fields
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.founding_member_applications;
CREATE POLICY "Anyone can submit an application"
  ON public.founding_member_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND notes IS NULL
    AND (
      (auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    )
  );

-- 3. push_subscriptions: restrict all policies to authenticated only
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can create own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. reality_progress: add DELETE policy
CREATE POLICY "Users delete own reality_progress"
  ON public.reality_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. grant_beta_trial: ignore caller-supplied id, use auth.uid() to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.grant_beta_trial(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  UPDATE public.profiles
  SET trial_type = 'beta',
      trial_started_at = COALESCE(trial_started_at, now()),
      trial_ends_at = GREATEST(
        COALESCE(trial_ends_at, now()),
        now() + interval '90 days'
      )
  WHERE user_id = _uid;
END;
$$;

-- 6. Revoke EXECUTE on internal helper functions from anon/authenticated (service role / RLS policy use only)
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_active_trial(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
