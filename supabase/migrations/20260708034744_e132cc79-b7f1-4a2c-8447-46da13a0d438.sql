CREATE OR REPLACE FUNCTION public.protect_profile_entitlement_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.subscription_tier      IS DISTINCT FROM OLD.subscription_tier
       OR NEW.is_founding_member     IS DISTINCT FROM OLD.is_founding_member
       OR NEW.founder_window_ends_at IS DISTINCT FROM OLD.founder_window_ends_at
       OR NEW.trial_started_at       IS DISTINCT FROM OLD.trial_started_at
       OR NEW.trial_ends_at          IS DISTINCT FROM OLD.trial_ends_at
       OR NEW.trial_type             IS DISTINCT FROM OLD.trial_type
    THEN
      RAISE EXCEPTION 'profiles entitlement columns may only be changed by the service role'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_entitlement ON public.profiles;
CREATE TRIGGER protect_profile_entitlement
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_entitlement_columns();