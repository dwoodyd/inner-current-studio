-- 1) handle_new_user: stop auto-flagging everyone as a founding member.
-- Keep the 90-day founder access window so they still see founding pricing,
-- but reserve the badge for paid lifetime buyers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
    false,                    -- changed: badge reserved for paid lifetime
    'free',
    'money'
  );
  RETURN NEW;
END;
$function$;

-- 2) Backfill: clear is_founding_member for anyone without an actual
-- claimed founder lifetime slot.
UPDATE public.profiles p
SET is_founding_member = false,
    updated_at = now()
WHERE is_founding_member = true
  AND NOT EXISTS (
    SELECT 1 FROM public.founder_lifetime_slots s
    WHERE s.user_id = p.user_id
  );

-- 3) Subscriptions table: key by paddle_subscription_id so re-subscribes
-- after cancel don't overwrite history.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_environment_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_paddle_subscription_id_key'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_paddle_subscription_id_key UNIQUE (paddle_subscription_id);
  END IF;
END $$;