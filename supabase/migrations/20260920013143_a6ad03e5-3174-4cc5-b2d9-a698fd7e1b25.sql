CREATE INDEX IF NOT EXISTS push_subscriptions_active_idx
  ON public.push_subscriptions (active, updated_at)
  WHERE active;

CREATE OR REPLACE FUNCTION public.push_subscriptions_due(_minute text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  endpoint text,
  p256dh text,
  auth_key text,
  send_morning boolean,
  send_evening boolean,
  send_return boolean,
  send_affirm boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.user_id,
    s.endpoint,
    s.p256dh,
    s.auth_key,
    (s.morning_reminder AND s.morning_time = _minute) AS send_morning,
    (s.evening_reflection AND s.evening_time = _minute) AS send_evening,
    (s.gentle_returns AND s.return_interval_hours > 0
      AND s.updated_at <= now() - make_interval(hours => s.return_interval_hours)) AS send_return,
    (COALESCE(s.affirmation_interval_minutes, 0) > 0
      AND s.updated_at <= now() - make_interval(mins => s.affirmation_interval_minutes)) AS send_affirm
  FROM public.push_subscriptions s
  WHERE s.active
    AND (
      (s.morning_reminder AND s.morning_time = _minute)
      OR (s.evening_reflection AND s.evening_time = _minute)
      OR (s.gentle_returns AND s.return_interval_hours > 0
          AND s.updated_at <= now() - make_interval(hours => s.return_interval_hours))
      OR (COALESCE(s.affirmation_interval_minutes, 0) > 0
          AND s.updated_at <= now() - make_interval(mins => s.affirmation_interval_minutes))
    );
$$;

REVOKE ALL ON FUNCTION public.push_subscriptions_due(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.push_subscriptions_due(text) TO service_role;