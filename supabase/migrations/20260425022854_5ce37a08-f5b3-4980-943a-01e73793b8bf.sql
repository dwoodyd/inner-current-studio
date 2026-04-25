-- Add trial columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_type text NOT NULL DEFAULT 'standard';

-- Backfill existing users: give everyone a 28-day trial from now
-- (so existing accounts aren't immediately on free tier)
UPDATE public.profiles
SET trial_started_at = COALESCE(trial_started_at, now()),
    trial_ends_at = COALESCE(trial_ends_at, now() + interval '28 days')
WHERE trial_ends_at IS NULL;

-- Update the new-user trigger to start a trial automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, trial_started_at, trial_ends_at, trial_type)
  VALUES (NEW.id, now(), now() + interval '28 days', 'standard');
  RETURN NEW;
END;
$function$;

-- Helper: is the user still within their free trial?
CREATE OR REPLACE FUNCTION public.has_active_trial(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at > now()
  );
$$;

-- Helper: extend a user to the 90-day beta trial (used when beta code redeemed)
CREATE OR REPLACE FUNCTION public.grant_beta_trial(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET trial_type = 'beta',
      trial_started_at = COALESCE(trial_started_at, now()),
      trial_ends_at = GREATEST(
        COALESCE(trial_ends_at, now()),
        now() + interval '90 days'
      )
  WHERE user_id = user_uuid;
END;
$$;