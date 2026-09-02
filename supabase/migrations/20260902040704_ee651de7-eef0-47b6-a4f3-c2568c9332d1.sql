CREATE OR REPLACE FUNCTION public.founders_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
    'total_slots', 100,
    'slots_claimed', (SELECT count(*) FROM public.founder_lifetime_slots WHERE environment = 'live'),
    'slots_claimed_sandbox', (SELECT count(*) FROM public.founder_lifetime_slots WHERE environment = 'sandbox'),
    'founding_members', (SELECT count(*) FROM public.profiles WHERE is_founding_member),
    'total_profiles', (SELECT count(*) FROM public.profiles),
    'tiers', (
      SELECT coalesce(jsonb_object_agg(t.subscription_tier, t.n), '{}'::jsonb)
      FROM (SELECT subscription_tier, count(*) AS n FROM public.profiles GROUP BY subscription_tier) t
    ),
    'applications', (
      SELECT coalesce(jsonb_object_agg(a.status, a.n), '{}'::jsonb)
      FROM (SELECT status, count(*) AS n FROM public.founding_member_applications GROUP BY status) a
    ),
    'active_subscriptions', (
      SELECT coalesce(jsonb_object_agg(s.price_id, s.n), '{}'::jsonb)
      FROM (
        SELECT coalesce(price_id, 'unknown') AS price_id, count(*) AS n
        FROM public.subscriptions
        WHERE status IN ('active','trialing','past_due')
        GROUP BY 1
      ) s
    ),
    'recent_founders', (
      SELECT coalesce(jsonb_agg(f ORDER BY f->>'claimed_at' DESC), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'user_id', s.user_id,
          'claimed_at', s.claimed_at,
          'environment', s.environment,
          'display_name', p.display_name
        ) AS f
        FROM public.founder_lifetime_slots s
        LEFT JOIN public.profiles p ON p.user_id = s.user_id
        ORDER BY s.claimed_at DESC
        LIMIT 25
      ) x
    ),
    'recent_applications', (
      SELECT coalesce(jsonb_agg(a ORDER BY a->>'created_at' DESC), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', id, 'name', name, 'email', email,
          'status', status, 'created_at', created_at
        ) AS a
        FROM public.founding_member_applications
        ORDER BY created_at DESC
        LIMIT 10
      ) y
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.founders_dashboard() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.founders_dashboard() TO authenticated;