
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool text NOT NULL,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool, usage_date)
);

GRANT SELECT, INSERT, UPDATE ON public.daily_usage TO authenticated;
GRANT ALL ON public.daily_usage TO service_role;

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own daily usage" ON public.daily_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own daily usage" ON public.daily_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own daily usage" ON public.daily_usage
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS daily_usage_user_date_idx
  ON public.daily_usage (user_id, usage_date);

CREATE OR REPLACE FUNCTION public.increment_daily_usage(_tool text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := (now() AT TIME ZONE 'utc')::date;
  _new_count integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  INSERT INTO public.daily_usage (user_id, tool, usage_date, count)
  VALUES (_uid, _tool, _today, 1)
  ON CONFLICT (user_id, tool, usage_date)
  DO UPDATE SET count = public.daily_usage.count + 1, updated_at = now()
  RETURNING count INTO _new_count;
  RETURN _new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_daily_usage(text) TO authenticated;
