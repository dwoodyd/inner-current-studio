-- invite_codes table
CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invite_codes TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invite codes"
  ON public.invite_codes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- invite_redemptions table
CREATE TABLE public.invite_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code_id uuid NOT NULL REFERENCES public.invite_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invite_code_id, user_id)
);

GRANT SELECT, INSERT ON public.invite_redemptions TO authenticated;
GRANT ALL ON public.invite_redemptions TO service_role;

ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions"
  ON public.invite_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage redemptions"
  ON public.invite_redemptions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER update_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Redeem function: atomic validate + increment + record
CREATE OR REPLACE FUNCTION public.redeem_invite_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _code_row public.invite_codes%ROWTYPE;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO _code_row
  FROM public.invite_codes
  WHERE upper(code) = upper(_code)
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.invite_redemptions (invite_code_id, user_id)
  VALUES (_code_row.id, _user_id)
  ON CONFLICT (invite_code_id, user_id) DO NOTHING;

  UPDATE public.invite_codes
  SET uses = uses + 1
  WHERE id = _code_row.id;

  RETURN true;
END;
$$;

-- Seed the existing hardcoded codes so the future server-side check matches today's behavior
INSERT INTO public.invite_codes (code, label, max_uses)
VALUES
  ('INNERWAKE-BETA', 'Open beta access', NULL),
  ('CURRENT20', 'Founding-20 circle', 20),
  ('QUIETRETURN', 'Soft landing invite', NULL)
ON CONFLICT (code) DO NOTHING;