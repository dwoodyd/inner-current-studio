CREATE TABLE public.current_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  practices_completed INTEGER NOT NULL DEFAULT 0,
  beliefs_landed_true TEXT[] NOT NULL DEFAULT '{}',
  beliefs_landed_alive TEXT[] NOT NULL DEFAULT '{}',
  sequences_completed TEXT[] NOT NULL DEFAULT '{}',
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  first_visited_at TIMESTAMP WITH TIME ZONE,
  last_visited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.current_progress TO authenticated;
GRANT ALL ON public.current_progress TO service_role;

ALTER TABLE public.current_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own current progress" ON public.current_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own current progress" ON public.current_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own current progress" ON public.current_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own current progress" ON public.current_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_current_progress_updated_at
  BEFORE UPDATE ON public.current_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_current_progress_user ON public.current_progress(user_id);