CREATE TABLE public.practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_slug TEXT NOT NULL,
  practice_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practices TO authenticated;
GRANT ALL ON public.practices TO service_role;

ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own practices"
ON public.practices FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own practices"
ON public.practices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own practices"
ON public.practices FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_practices_user_created ON public.practices(user_id, created_at DESC);
CREATE INDEX idx_practices_user_slug ON public.practices(user_id, current_slug);