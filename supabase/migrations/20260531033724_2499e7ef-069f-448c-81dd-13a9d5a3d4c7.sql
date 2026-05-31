
-- Add founding-member tracking to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_founding_member boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS founder_window_ends_at timestamptz;

-- Track which user occupies each of the 100 founding lifetime slots
CREATE TABLE IF NOT EXISTS public.founder_lifetime_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  paddle_subscription_id text,
  environment text NOT NULL DEFAULT 'live',
  claimed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.founder_lifetime_slots TO anon, authenticated;
GRANT ALL ON public.founder_lifetime_slots TO service_role;

ALTER TABLE public.founder_lifetime_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read slot count"
  ON public.founder_lifetime_slots FOR SELECT
  USING (true);

CREATE POLICY "Service role manages slots"
  ON public.founder_lifetime_slots FOR ALL
  USING (auth.role() = 'service_role');

-- Helper: founding lifetime slots remaining (of 100 total)
CREATE OR REPLACE FUNCTION public.founder_slots_remaining()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 100 - (SELECT count(*)::int FROM public.founder_lifetime_slots WHERE environment = 'live'));
$$;

-- Update new-user trigger: 90-day founder window + founding-member flag
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    trial_started_at,
    trial_ends_at,
    trial_type,
    founder_window_ends_at,
    is_founding_member,
    subscription_tier,
    free_current
  )
  VALUES (
    NEW.id,
    now(),
    now() + interval '90 days',
    'beta',
    now() + interval '90 days',
    true,
    'free',
    'money'
  );
  RETURN NEW;
END;
$function$;

-- Migration for existing trial users: fresh 90-day founder window
-- (Skip anyone already on a paid lifetime/premium tier.)
UPDATE public.profiles
SET
  trial_started_at = COALESCE(trial_started_at, now()),
  trial_ends_at = now() + interval '90 days',
  founder_window_ends_at = now() + interval '90 days',
  trial_type = 'beta',
  is_founding_member = true,
  free_current = COALESCE(free_current, 'money'),
  updated_at = now()
WHERE subscription_tier = 'free'
  AND (trial_ends_at IS NULL OR trial_ends_at > now() - interval '7 days');

-- Existing $99 lifetime customers: flag them as founding members
UPDATE public.profiles
SET is_founding_member = true, updated_at = now()
WHERE subscription_tier = 'lifetime' AND is_founding_member = false;
