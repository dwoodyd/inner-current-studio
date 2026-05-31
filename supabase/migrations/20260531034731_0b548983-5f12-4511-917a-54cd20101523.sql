
-- Flag existing lifetime customers as founding members
UPDATE public.profiles
SET is_founding_member = true
WHERE subscription_tier = 'lifetime' AND is_founding_member = false;

-- Reserve founder slots for existing lifetime subscriptions (live env)
INSERT INTO public.founder_lifetime_slots (user_id, paddle_subscription_id, environment, claimed_at)
SELECT s.user_id, s.paddle_subscription_id, 'live', COALESCE(s.created_at, now())
FROM public.subscriptions s
JOIN public.profiles p ON p.user_id = s.user_id
WHERE p.subscription_tier = 'lifetime'
  AND s.environment = 'live'
  AND NOT EXISTS (
    SELECT 1 FROM public.founder_lifetime_slots f
    WHERE f.user_id = s.user_id AND f.environment = 'live'
  );
