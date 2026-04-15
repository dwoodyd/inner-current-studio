
CREATE TABLE public.affirmation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  count INTEGER NOT NULL DEFAULT 1,
  affirmation_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affirmation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own affirmation_sessions"
  ON public.affirmation_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_affirmation_sessions_user ON public.affirmation_sessions(user_id);
